import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

/**
 * Transaction Manager for handling database transactions with rollback support
 * Prevents race conditions and ensures data consistency
 */

export interface TransactionOptions {
  maxRetries?: number
  timeout?: number
  isolationLevel?: Prisma.TransactionIsolationLevel
}

const DEFAULT_OPTIONS: Required<TransactionOptions> = {
  maxRetries: 3,
  timeout: 10000, // 10 seconds
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
}

/**
 * Execute a transaction with automatic retry on failure
 */
export async function executeTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await prisma.$transaction(callback, {
        maxWait: opts.timeout,
        timeout: opts.timeout,
        isolationLevel: opts.isolationLevel
      })
    } catch (error) {
      lastError = error as Error
      console.error(`Transaction attempt ${attempt}/${opts.maxRetries} failed:`, error)

      // Don't retry on validation errors or business logic errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const nonRetryableCodes = ['P2002', 'P2003', 'P2025'] // Unique constraint, foreign key, record not found
        if (nonRetryableCodes.includes(error.code)) {
          throw error
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < opts.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Transaction failed after max retries')
}

/**
 * Tournament Join Transaction - Handles slot availability race condition
 */
export async function joinTournamentTransaction(
  userId: string,
  tournamentId: string,
  paymentId: string | null = null
) {
  return executeTransaction(async (tx) => {
    // Lock the tournament row for update
    const tournament = await tx.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                paymentStatus: 'PAID'
              }
            }
          }
        }
      }
    })

    if (!tournament) {
      throw new Error('Tournament not found')
    }

    // Check if tournament is full
    if (tournament._count.registrations >= tournament.maxPlayers) {
      throw new Error('Tournament is full')
    }

    // Check if user already registered
    const existingRegistration = await tx.registration.findUnique({
      where: {
        userId_tournamentId: {
          userId,
          tournamentId
        }
      }
    })

    if (existingRegistration) {
      throw new Error('Already registered for this tournament')
    }

    // Check tournament status
    if (tournament.status !== 'UPCOMING') {
      throw new Error(`Cannot join ${tournament.status.toLowerCase()} tournament`)
    }

    // Check user wallet balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (Number(user.walletBalance) < Number(tournament.entryFee)) {
      throw new Error('Insufficient wallet balance')
    }

    // Deduct entry fee from wallet
    await tx.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          decrement: tournament.entryFee
        }
      }
    })

    // Create tournament fee transaction
    await tx.transaction.create({
      data: {
        userId,
        type: 'TOURNAMENT_FEE',
        amount: tournament.entryFee,
        status: 'SUCCESS',
        description: `Entry fee for ${tournament.title}`,
        metadata: { tournamentId }
      }
    })

    // Create registration
    const registration = await tx.registration.create({
      data: {
        userId,
        tournamentId,
        paymentStatus: 'PAID',
        paymentId
      }
    })

    return { registration, tournament }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable // Prevent race conditions
  })
}

/**
 * Cancel Registration Transaction - Handles refunds
 */
export async function cancelRegistrationTransaction(
  registrationId: string,
  userId: string
) {
  return executeTransaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { tournament: true }
    })

    if (!registration) {
      throw new Error('Registration not found')
    }

    if (registration.userId !== userId) {
      throw new Error('Unauthorized')
    }

    if (registration.tournament.status === 'LIVE' || registration.tournament.status === 'COMPLETED') {
      throw new Error('Cannot cancel registration for live or completed tournament')
    }

    let refundAmount = 0

    if (registration.paymentStatus === 'PAID') {
      refundAmount = Number(registration.tournament.entryFee)

      // Refund to wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: refundAmount
          }
        }
      })

      // Create refund transaction
      await tx.transaction.create({
        data: {
          userId,
          type: 'REFUND',
          amount: refundAmount,
          status: 'SUCCESS',
          description: `Refund for cancelled registration: ${registration.tournament.title}`,
          metadata: {
            tournamentId: registration.tournamentId,
            registrationId
          }
        }
      })

      // Update registration payment status
      await tx.registration.update({
        where: { id: registrationId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'DISQUALIFIED'
        }
      })
    }

    return { refundAmount, tournament: registration.tournament }
  })
}

/**
 * Distribute Winnings Transaction - Handles prize distribution
 */
export async function distributeWinningsTransaction(
  tournamentId: string,
  results: Array<{ userId: string; rank: number; kills?: number; points?: number; winnings: number }>
) {
  return executeTransaction(async (tx) => {
    const tournament = await tx.tournament.findUnique({
      where: { id: tournamentId }
    })

    if (!tournament) {
      throw new Error('Tournament not found')
    }

    if (tournament.status === 'COMPLETED') {
      throw new Error('Results already submitted')
    }

    const updates = []

    for (const result of results) {
      // Update registration
      await tx.registration.updateMany({
        where: {
          tournamentId,
          userId: result.userId
        },
        data: {
          rank: result.rank,
          kills: result.kills,
          points: result.points,
          winnings: result.winnings,
          status: 'COMPLETED'
        }
      })

      // Credit winnings to wallet
      if (result.winnings > 0) {
        await tx.user.update({
          where: { id: result.userId },
          data: {
            walletBalance: {
              increment: result.winnings
            }
          }
        })

        // Create winning transaction
        await tx.transaction.create({
          data: {
            userId: result.userId,
            type: 'TOURNAMENT_WINNING',
            amount: result.winnings,
            status: 'SUCCESS',
            description: `Winnings from ${tournament.title}`,
            metadata: {
              tournamentId,
              rank: result.rank,
              kills: result.kills,
              points: result.points
            }
          }
        })
      }

      updates.push({ userId: result.userId, rank: result.rank, winnings: result.winnings })
    }

    // Update tournament status
    await tx.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'COMPLETED',
        endTime: new Date()
      }
    })

    return { tournament, updates }
  })
}

/**
 * Process Withdrawal Transaction - Handles wallet withdrawals
 */
export async function processWithdrawalTransaction(
  userId: string,
  amount: number
) {
  return executeTransaction(async (tx) => {
    // Get user with lock
    const user = await tx.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.kycVerified) {
      throw new Error('KYC verification required for withdrawals')
    }

    if (Number(user.walletBalance) < amount) {
      throw new Error('Insufficient balance')
    }

    // Deduct from wallet
    await tx.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          decrement: amount
        }
      }
    })

    // Create withdrawal transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        amount,
        status: 'PENDING',
        description: 'Withdrawal request'
      }
    })

    return { transaction, user }
  })
}

/**
 * Cancel Tournament Transaction - Handles tournament cancellation with refunds
 */
export async function cancelTournamentTransaction(tournamentId: string) {
  return executeTransaction(async (tx) => {
    const tournament = await tx.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: {
            paymentStatus: 'PAID'
          }
        }
      }
    })

    if (!tournament) {
      throw new Error('Tournament not found')
    }

    if (tournament.status === 'COMPLETED') {
      throw new Error('Cannot cancel completed tournament')
    }

    let totalRefunded = 0

    // Process refunds
    for (const registration of tournament.registrations) {
      await tx.user.update({
        where: { id: registration.userId },
        data: {
          walletBalance: {
            increment: tournament.entryFee
          }
        }
      })

      await tx.transaction.create({
        data: {
          userId: registration.userId,
          type: 'REFUND',
          amount: tournament.entryFee,
          status: 'SUCCESS',
          description: `Refund for cancelled tournament: ${tournament.title}`,
          metadata: {
            tournamentId,
            registrationId: registration.id
          }
        }
      })

      await tx.registration.update({
        where: { id: registration.id },
        data: {
          status: 'DISQUALIFIED',
          paymentStatus: 'REFUNDED'
        }
      })

      totalRefunded += Number(tournament.entryFee)
    }

    // Update tournament status
    await tx.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'CANCELLED'
      }
    })

    return {
      tournament,
      refundsProcessed: tournament.registrations.length,
      totalRefunded
    }
  })
}

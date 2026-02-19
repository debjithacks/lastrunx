import { prisma } from './prisma'
import { logger } from './logger'

/**
 * Fraud Detection & Analytics System
 * Identifies suspicious patterns and provides insights
 */

export interface FraudAlert {
  userId: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  evidence: Record<string, any>
  timestamp: Date
}

/**
 * Detect multiple accounts from same device/IP
 */
export async function detectMultipleAccounts(ipAddress: string): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = []

  try {
    // In production, store IP addresses in User model or separate table
    // For now, this is a placeholder showing the concept
    
    // You would query users with same IP and check for suspicious patterns:
    // - Created within short time
    // - Similar usernames
    // - Referred each other
    // - Playing in same tournaments

    logger.info('Multi-account detection check', { ipAddress })
    
    // Placeholder implementation
    return alerts
  } catch (error) {
    logger.error('Multi-account detection failed', error as Error, { ipAddress })
    return alerts
  }
}

/**
 * Detect suspicious withdrawal patterns
 */
export async function detectSuspiciousWithdrawals(userId: string): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = []

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        transactions: {
          where: {
            type: 'WITHDRAWAL'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!user) return alerts

    // Check 1: New account withdrawing immediately
    const accountAge = Date.now() - user.createdAt.getTime()
    const oneDayMs = 24 * 60 * 60 * 1000
    
    if (accountAge < oneDayMs && user.transactions.length > 0) {
      alerts.push({
        userId,
        type: 'QUICK_WITHDRAWAL',
        severity: 'HIGH',
        description: 'User attempting withdrawal within 24 hours of registration',
        evidence: {
          accountAge: Math.round(accountAge / (60 * 60 * 1000)) + ' hours',
          withdrawalCount: user.transactions.length
        },
        timestamp: new Date()
      })
    }

    // Check 2: Multiple rapid withdrawals
    if (user.transactions.length >= 3) {
      const recentWithdrawals = user.transactions.slice(0, 3)
      const timeSpan = recentWithdrawals[0].createdAt.getTime() - recentWithdrawals[2].createdAt.getTime()
      
      if (timeSpan < 60 * 60 * 1000) { // 3 withdrawals in 1 hour
        alerts.push({
          userId,
          type: 'RAPID_WITHDRAWALS',
          severity: 'MEDIUM',
          description: 'Multiple withdrawals in short time period',
          evidence: {
            count: 3,
            timeSpanMinutes: Math.round(timeSpan / (60 * 1000))
          },
          timestamp: new Date()
        })
      }
    }

    // Check 3: Large withdrawal without significant gameplay history
    const largeWithdrawal = user.transactions.find(t => Number(t.amount) > 10000)
    if (largeWithdrawal) {
      const registrationCount = await prisma.registration.count({
        where: { userId }
      })

      if (registrationCount < 5) {
        alerts.push({
          userId,
          type: 'LARGE_WITHDRAWAL_LOW_ACTIVITY',
          severity: 'HIGH',
          description: 'Large withdrawal with minimal tournament participation',
          evidence: {
            withdrawalAmount: Number(largeWithdrawal.amount),
            tournamentCount: registrationCount
          },
          timestamp: new Date()
        })
      }
    }

    return alerts
  } catch (error) {
    logger.error('Withdrawal fraud detection failed', error as Error, { userId })
    return alerts
  }
}

/**
 * Detect tournament manipulation/collusion
 */
export async function detectTournamentManipulation(tournamentId: string): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = []

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    if (!tournament) return alerts

    // Check 1: Multiple new accounts in same tournament
    const newAccounts = tournament.registrations.filter(r => {
      const accountAge = Date.now() - r.user.createdAt.getTime()
      return accountAge < 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    if (newAccounts.length >= 3) {
      alerts.push({
        userId: 'SYSTEM',
        type: 'MULTIPLE_NEW_ACCOUNTS',
        severity: 'MEDIUM',
        description: 'Multiple new accounts in same tournament',
        evidence: {
          tournamentId,
          newAccountCount: newAccounts.length,
          totalParticipants: tournament.registrations.length
        },
        timestamp: new Date()
      })
    }

    // Check 2: Suspicious win patterns (same user winning repeatedly)
    const recentWinners = await prisma.registration.findMany({
      where: {
        tournament: {
          game: tournament.game
        },
        rank: 1,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        userId: true,
        tournament: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    const winCounts = recentWinners.reduce((acc, r) => {
      acc[r.userId] = (acc[r.userId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const suspiciousWinners = Object.entries(winCounts).filter(([_, count]) => count >= 3)
    
    if (suspiciousWinners.length > 0) {
      for (const [userId, count] of suspiciousWinners) {
        alerts.push({
          userId,
          type: 'SUSPICIOUS_WIN_PATTERN',
          severity: 'HIGH',
          description: 'User winning unusually high number of recent tournaments',
          evidence: {
            game: tournament.game,
            winCount: count,
            period: '7 days'
          },
          timestamp: new Date()
        })
      }
    }

    return alerts
  } catch (error) {
    logger.error('Tournament manipulation detection failed', error as Error, { tournamentId })
    return alerts
  }
}

/**
 * Detect payment fraud
 */
export async function detectPaymentFraud(userId: string): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = []

  try {
    // Check for failed payment attempts
    const failedPayments = await prisma.transaction.count({
      where: {
        userId,
        type: 'DEPOSIT',
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    if (failedPayments >= 5) {
      alerts.push({
        userId,
        type: 'MULTIPLE_FAILED_PAYMENTS',
        severity: 'MEDIUM',
        description: 'Multiple failed payment attempts',
        evidence: {
          failedCount: failedPayments,
          period: '24 hours'
        },
        timestamp: new Date()
      })
    }

    return alerts
  } catch (error) {
    logger.error('Payment fraud detection failed', error as Error, { userId })
    return alerts
  }
}

/**
 * Get user risk score
 */
export async function getUserRiskScore(userId: string): Promise<{
  score: number // 0-100, higher = more risky
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: string[]
}> {
  let score = 0
  const factors: string[] = []

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        registrations: true,
        transactions: true,
        fines: true,
        disputes: true
      }
    })

    if (!user) {
      return { score: 0, level: 'LOW', factors: [] }
    }

    // Factor 1: Account age
    const accountAge = Date.now() - user.createdAt.getTime()
    if (accountAge < 7 * 24 * 60 * 60 * 1000) {
      score += 15
      factors.push('New account (less than 7 days)')
    }

    // Factor 2: KYC verification
    if (!user.kycVerified) {
      score += 10
      factors.push('KYC not verified')
    }

    // Factor 3: Fines and disputes
    const activeFines = user.fines.filter(f => f.status === 'ACTIVE').length
    if (activeFines > 0) {
      score += activeFines * 10
      factors.push(`${activeFines} active fine(s)`)
    }

    const rejectedDisputes = user.disputes.filter(d => d.status === 'REJECTED').length
    if (rejectedDisputes > 0) {
      score += rejectedDisputes * 5
      factors.push(`${rejectedDisputes} rejected dispute(s)`)
    }

    // Factor 4: Failed transactions
    const failedTransactions = user.transactions.filter(t => t.status === 'FAILED').length
    if (failedTransactions > 5) {
      score += 15
      factors.push(`High number of failed transactions (${failedTransactions})`)
    }

    // Factor 5: Withdrawal to deposit ratio
    const totalDeposits = user.transactions
      .filter(t => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const totalWithdrawals = user.transactions
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    if (totalDeposits > 0 && totalWithdrawals / totalDeposits > 2) {
      score += 20
      factors.push('High withdrawal to deposit ratio')
    }

    // Factor 6: Low tournament participation
    if (user.registrations.length < 3 && totalWithdrawals > 1000) {
      score += 25
      factors.push('Low tournament activity with significant withdrawals')
    }

    // Determine level
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
    if (score >= 70) level = 'CRITICAL'
    else if (score >= 50) level = 'HIGH'
    else if (score >= 30) level = 'MEDIUM'

    return { score, level, factors }
  } catch (error) {
    logger.error('Risk score calculation failed', error as Error, { userId })
    return { score: 0, level: 'LOW', factors: ['Error calculating risk'] }
  }
}

/**
 * Run comprehensive fraud check
 */
export async function runFraudCheck(userId: string): Promise<{
  alerts: FraudAlert[]
  riskScore: Awaited<ReturnType<typeof getUserRiskScore>>
}> {
  try {
    const [withdrawalAlerts, paymentAlerts, riskScore] = await Promise.all([
      detectSuspiciousWithdrawals(userId),
      detectPaymentFraud(userId),
      getUserRiskScore(userId)
    ])

    const alerts = [...withdrawalAlerts, ...paymentAlerts]

    // Log fraud check results
    if (alerts.length > 0 || riskScore.level !== 'LOW') {
      logger.securityEvent(
        `Fraud check completed for user`,
        riskScore.level,
        {
          userId,
          alertCount: alerts.length,
          riskScore: riskScore.score
        }
      )
    }

    return { alerts, riskScore }
  } catch (error) {
    logger.error('Fraud check failed', error as Error, { userId })
    throw error
  }
}

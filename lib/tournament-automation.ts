import { prisma } from './prisma'
import { sendEmail } from './email'
import { sendSMS } from './sms'
import { logger } from './logger'

/**
 * Automated Tournament Management System
 * Handles status transitions, reminders, and cleanup
 */

/**
 * Check and update tournament statuses based on time
 * Should be run every 5-10 minutes via cron job
 */
export async function updateTournamentStatuses() {
  const now = new Date()
  let updated = 0

  try {
    // 1. Mark UPCOMING tournaments as LIVE if startTime has passed
    const tournamentsToStart = await prisma.tournament.findMany({
      where: {
        status: 'UPCOMING',
        startTime: {
          lte: now
        },
        roomId: {
          not: null
        }
      },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                paymentStatus: 'PAID'
              }
            }
          }
        },
        registrations: {
          where: {
            paymentStatus: 'PAID'
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                username: true
              }
            }
          }
        }
      }
    })

    for (const tournament of tournamentsToStart) {
      // Check if minimum players requirement met
      if (tournament._count.registrations >= tournament.minPlayers) {
        await prisma.$transaction(async (tx) => {
          // Update tournament status
          await tx.tournament.update({
            where: { id: tournament.id },
            data: { status: 'LIVE' }
          })

          // Update all registrations to PLAYING
          await tx.registration.updateMany({
            where: {
              tournamentId: tournament.id,
              paymentStatus: 'PAID'
            },
            data: { status: 'PLAYING' }
          })
        })

        logger.tournamentEvent('Tournament auto-started', tournament.id, {
          registrations: tournament._count.registrations,
          game: tournament.game
        })

        // Send notifications to participants
        for (const registration of tournament.registrations) {
          sendEmail(
            registration.user.email,
            `Tournament Started: ${tournament.title}`,
            `
              <h2>🎮 Tournament Has Started!</h2>
              <p>Hi ${registration.user.username},</p>
              <p>The tournament <strong>${tournament.title}</strong> has started.</p>
              <p><strong>Room Details:</strong></p>
              <ul>
                <li>Room ID: ${tournament.roomId}</li>
                ${tournament.roomPassword ? `<li>Password: ${tournament.roomPassword}</li>` : ''}
              </ul>
              <p>Good luck!</p>
            `
          ).catch(err => logger.error('Failed to send tournament start email', err))

          if (registration.user.phone) {
            sendSMS(
              registration.user.phone,
              `Tournament ${tournament.title} has started! Room ID: ${tournament.roomId}${tournament.roomPassword ? ` Password: ${tournament.roomPassword}` : ''}`
            ).catch(err => logger.error('Failed to send tournament start SMS', err))
          }
        }

        updated++
      } else {
        // Cancel tournament if minimum players not met
        await cancelTournamentDueToLowParticipation(tournament.id)
      }
    }

    // 2. Mark LIVE tournaments as COMPLETED if endTime has passed (without results)
    const tournamentsToComplete = await prisma.tournament.findMany({
      where: {
        status: 'LIVE',
        endTime: {
          lte: now
        }
      }
    })

    for (const tournament of tournamentsToComplete) {
      // Only auto-complete if endTime is more than 1 hour ago (grace period for admin)
      const hoursSinceEnd = (now.getTime() - new Date(tournament.endTime!).getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceEnd > 1) {
        await prisma.tournament.update({
          where: { id: tournament.id },
          data: { 
            status: 'COMPLETED',
            endTime: tournament.endTime
          }
        })

        logger.tournamentEvent('Tournament auto-completed (no results)', tournament.id, {
          hoursSinceEnd
        })

        updated++
      }
    }

    logger.info(`Tournament status update completed: ${updated} tournaments updated`)
    return { success: true, updated }
  } catch (error) {
    logger.error('Failed to update tournament statuses', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Cancel tournament due to insufficient participants
 */
async function cancelTournamentDueToLowParticipation(tournamentId: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { paymentStatus: 'PAID' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true
              }
            }
          }
        }
      }
    })

    if (!tournament) return

    await prisma.$transaction(async (tx) => {
      // Refund all participants
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
            description: `Refund: ${tournament.title} cancelled due to insufficient participants`,
            metadata: {
              tournamentId,
              reason: 'Minimum players not reached'
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

        // Notify participants
        sendEmail(
          registration.user.email,
          `Tournament Cancelled: ${tournament.title}`,
          `
            <h2>Tournament Cancelled</h2>
            <p>Hi ${registration.user.username},</p>
            <p>Unfortunately, the tournament <strong>${tournament.title}</strong> has been cancelled due to insufficient participants (minimum ${tournament.minPlayers} required).</p>
            <p>Your entry fee of ₹${tournament.entryFee} has been refunded to your wallet.</p>
            <p>We apologize for the inconvenience.</p>
          `
        ).catch(err => logger.error('Failed to send cancellation email', err))
      }

      // Mark tournament as cancelled
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: 'CANCELLED' }
      })
    })

    logger.tournamentEvent('Tournament auto-cancelled (low participation)', tournamentId, {
      registrations: tournament.registrations.length,
      minRequired: tournament.minPlayers
    })
  } catch (error) {
    logger.error('Failed to cancel tournament', error as Error, { tournamentId })
  }
}

/**
 * Send reminders for upcoming tournaments
 * Should be run every hour
 */
export async function sendTournamentReminders() {
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
  let remindersSent = 0

  try {
    // Find tournaments starting in 1 hour
    const upcomingTournaments = await prisma.tournament.findMany({
      where: {
        status: 'UPCOMING',
        startTime: {
          gte: now,
          lte: oneHourFromNow
        }
      },
      include: {
        registrations: {
          where: {
            paymentStatus: 'PAID'
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                username: true
              }
            }
          }
        }
      }
    })

    for (const tournament of upcomingTournaments) {
      const minutesUntilStart = Math.round((tournament.startTime.getTime() - now.getTime()) / (1000 * 60))

      for (const registration of tournament.registrations) {
        // Send email reminder
        sendEmail(
          registration.user.email,
          `Reminder: Tournament Starting Soon - ${tournament.title}`,
          `
            <h2>⏰ Tournament Reminder</h2>
            <p>Hi ${registration.user.username},</p>
            <p>Your tournament <strong>${tournament.title}</strong> starts in approximately ${minutesUntilStart} minutes!</p>
            <p><strong>Details:</strong></p>
            <ul>
              <li>Game: ${tournament.game}</li>
              <li>Start Time: ${tournament.startTime.toLocaleString()}</li>
              <li>Mode: ${tournament.mode}</li>
            </ul>
            ${tournament.roomId ? `
              <p><strong>Room Details:</strong></p>
              <ul>
                <li>Room ID: ${tournament.roomId}</li>
                ${tournament.roomPassword ? `<li>Password: ${tournament.roomPassword}</li>` : ''}
              </ul>
            ` : '<p>Room details will be shared shortly before the tournament starts.</p>'}
            <p>Be ready and good luck! 🎮</p>
          `
        ).catch(err => logger.error('Failed to send tournament reminder email', err))

        // Send SMS reminder
        if (registration.user.phone) {
          sendSMS(
            registration.user.phone,
            `Reminder: ${tournament.title} starts in ${minutesUntilStart} minutes! Be ready. Good luck!`
          ).catch(err => logger.error('Failed to send tournament reminder SMS', err))
        }

        remindersSent++
      }

      logger.tournamentEvent('Tournament reminders sent', tournament.id, {
        recipientCount: tournament.registrations.length,
        minutesUntilStart
      })
    }

    logger.info(`Tournament reminders sent: ${remindersSent} reminders`)
    return { success: true, remindersSent }
  } catch (error) {
    logger.error('Failed to send tournament reminders', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Cleanup old data
 * Should be run daily
 */
export async function cleanupOldData() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  let cleaned = 0

  try {
    // Delete old admin activity logs (keep 30 days)
    const deletedLogs = await prisma.adminActivity.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })
    cleaned += deletedLogs.count

    // Delete expired verification tokens
    const deletedTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    cleaned += deletedTokens.count

    logger.info(`Data cleanup completed: ${cleaned} records deleted`)
    return { success: true, cleaned }
  } catch (error) {
    logger.error('Failed to cleanup old data', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Update user activity status
 * Mark users as inactive if no activity in 30 days
 */
export async function updateUserActivityStatus() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  try {
    // This would require updating lastActive timestamp in various user actions
    // For now, just log inactive users
    const inactiveUsers = await prisma.user.count({
      where: {
        lastActive: {
          lt: thirtyDaysAgo
        },
        isActive: true
      }
    })

    logger.info(`Found ${inactiveUsers} inactive users (30+ days)`)
    return { success: true, inactiveUserCount: inactiveUsers }
  } catch (error) {
    logger.error('Failed to update user activity status', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Main scheduler function
 * Call this from your cron job or scheduler
 */
export async function runScheduledTasks(taskType: 'status' | 'reminders' | 'cleanup' | 'all') {
  logger.info(`Running scheduled task: ${taskType}`)

  const results: Record<string, any> = {}

  try {
    if (taskType === 'status' || taskType === 'all') {
      results.statusUpdate = await updateTournamentStatuses()
    }

    if (taskType === 'reminders' || taskType === 'all') {
      results.reminders = await sendTournamentReminders()
    }

    if (taskType === 'cleanup' || taskType === 'all') {
      results.cleanup = await cleanupOldData()
      results.activityUpdate = await updateUserActivityStatus()
    }

    logger.info('Scheduled tasks completed', results)
    return { success: true, results }
  } catch (error) {
    logger.error('Scheduled tasks failed', error as Error)
    return { success: false, error: (error as Error).message }
  }
}

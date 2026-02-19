import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger, extractRequestContext } from '@/lib/logger'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

const bulkTournamentActionSchema = z.object({
  tournamentIds: z.array(z.string()).min(1).max(50),
  action: z.enum(['CANCEL', 'START', 'COMPLETE']),
  reason: z.string().min(10).max(500).optional()
})

/**
 * POST /api/admin/tournaments/bulk-action
 * Perform bulk actions on multiple tournaments
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'TOURNAMENT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = bulkTournamentActionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { tournamentIds, action, reason } = validation.data

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const tournamentId of tournamentIds) {
      try {
        const tournament = await prisma.tournament.findUnique({
          where: { id: tournamentId },
          include: {
            registrations: {
              include: {
                user: true
              }
            }
          }
        })

        if (!tournament) {
          errors.push(`Tournament ${tournamentId} not found`)
          failCount++
          continue
        }

        switch (action) {
          case 'CANCEL':
            // Cancel tournament and refund all participants
            await prisma.$transaction(async (tx) => {
              // Issue refunds
              for (const reg of tournament.registrations) {
                if (reg.paymentStatus === 'PAID') {
                  await tx.user.update({
                    where: { id: reg.userId },
                    data: {
                      walletBalance: {
                        increment: tournament.entryFee
                      }
                    }
                  })

                  await tx.transaction.create({
                    data: {
                      userId: reg.userId,
                      type: 'REFUND',
                      amount: tournament.entryFee,
                      status: 'SUCCESS',
                      description: `Refund for cancelled tournament: ${tournament.title}${reason ? ` - ${reason}` : ''}`
                    }
                  })
                }
              }

              // Update tournament status
              await tx.tournament.update({
                where: { id: tournamentId },
                data: {
                  status: 'CANCELLED'
                }
              })

              // Send notifications
              for (const reg of tournament.registrations) {
                await sendEmail(
                  reg.user.email,
                  'Tournament Cancelled',
                  `<p>The tournament "${tournament.title}" has been cancelled.</p>
                   <p>Your entry fee of ₹${tournament.entryFee} has been refunded to your wallet.</p>
                   ${reason ? `<p>Reason: ${reason}</p>` : ''}`
                )
              }
            })
            break

          case 'START':
            if (tournament.status !== 'UPCOMING') {
              errors.push(`Tournament ${tournamentId} is not in UPCOMING status`)
              failCount++
              continue
            }

            await prisma.tournament.update({
              where: { id: tournamentId },
              data: { status: 'LIVE' }
            })
            break

          case 'COMPLETE':
            if (tournament.status !== 'LIVE') {
              errors.push(`Tournament ${tournamentId} is not in LIVE status`)
              failCount++
              continue
            }

            await prisma.tournament.update({
              where: { id: tournamentId },
              data: { status: 'COMPLETED' }
            })
            break
        }

        successCount++
      } catch (error) {
        failCount++
        errors.push(`Failed to ${action} tournament ${tournamentId}: ${(error as Error).message}`)
      }
    }

    // Log admin action
    await prisma.adminActivity.create({
      data: {
        adminId: session.user.id,
        action: `BULK_TOURNAMENT_${action}`,
        targetType: 'TOURNAMENT',
        targetId: tournamentIds.join(','),
        details: {
          tournamentIds,
          action,
          reason,
          successCount,
          failCount
        }
      }
    })

    logger.info('Bulk tournament action completed', {
      adminId: session.user.id,
      action,
      tournamentCount: tournamentIds.length,
      successCount,
      failCount
    })

    return NextResponse.json({
      success: true,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    const requestContext = extractRequestContext(req)
    logger.error('Bulk tournament action error', error as Error, requestContext)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

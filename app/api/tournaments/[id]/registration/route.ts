import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/tournaments/[id]/registration - Cancel user's registration
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get registration
    const registration = await prisma.registration.findUnique({
      where: {
        userId_tournamentId: {
          userId: session.user.id,
          tournamentId
        }
      },
      include: {
        tournament: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    const tournament = registration.tournament

    // Check tournament status
    if (tournament.status === 'LIVE') {
      return NextResponse.json(
        { error: 'Cannot cancel registration for a live tournament' },
        { status: 400 }
      )
    }

    if (tournament.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel registration for a completed tournament' },
        { status: 400 }
      )
    }

    if (tournament.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Tournament is already cancelled' },
        { status: 400 }
      )
    }

    // Check if cancellation is allowed based on time
    const now = new Date()
    const tournamentStartTime = new Date(tournament.startTime)
    const hoursUntilStart = (tournamentStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Allow cancellation only if more than 2 hours before start
    if (hoursUntilStart < 2) {
      return NextResponse.json(
        { error: 'Cannot cancel registration less than 2 hours before tournament start' },
        { status: 400 }
      )
    }

    // Process cancellation with refund
    let refundAmount = 0
    
    await prisma.$transaction(async (tx) => {
      // Update registration status
      await tx.registration.update({
        where: { id: registration.id },
        data: {
          status: 'DISQUALIFIED'
        }
      })

      // Process refund if payment was successful
      if (registration.paymentStatus === 'PAID') {
        refundAmount = Number(tournament.entryFee)

        // Refund to wallet
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            walletBalance: {
              increment: refundAmount
            }
          }
        })

        // Create refund transaction
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'REFUND',
            amount: refundAmount,
            status: 'SUCCESS',
            description: `Refund for cancelled registration: ${tournament.title}`,
            metadata: {
              tournamentId,
              registrationId: registration.id,
              reason: 'User cancelled registration'
            }
          }
        })

        // Update payment status
        await tx.registration.update({
          where: { id: registration.id },
          data: {
            paymentStatus: 'REFUNDED'
          }
        })
      }
    })

    return NextResponse.json({
      message: 'Registration cancelled successfully',
      refunded: refundAmount > 0,
      refundAmount
    })
  } catch (error) {
    console.error('Cancel registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

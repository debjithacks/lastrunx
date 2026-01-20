import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewRoomDetails } from '@/lib/admin-utils'

// GET /api/tournaments/[id]/room-details - Get room details (15-30 min before start)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is registered
    const registration = await prisma.registration.findUnique({
      where: {
        userId_tournamentId: {
          userId: session.user.id,
          tournamentId: params.id,
        },
      },
      include: {
        tournament: true,
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'You are not registered for this tournament' },
        { status: 403 }
      )
    }

    if (registration.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 403 }
      )
    }

    const tournament = registration.tournament

    // Check if room details can be viewed (15-30 min before start)
    const canView = canViewRoomDetails(tournament.startTime)

    if (!canView) {
      const startTime = new Date(tournament.startTime)
      const now = new Date()
      const minutesUntilStart = Math.floor((startTime.getTime() - now.getTime()) / 60000)

      return NextResponse.json(
        {
          error: 'Room details not yet available',
          message: `Room details will be available 15-30 minutes before the tournament starts (in ${minutesUntilStart} minutes)`,
          startTime: tournament.startTime,
        },
        { status: 403 }
      )
    }

    // Return room details
    return NextResponse.json({
      roomId: tournament.roomId,
      roomPassword: tournament.roomPassword,
      startTime: tournament.startTime,
      message: 'Join the room 5 minutes before start time',
      rules: tournament.rules,
    })
  } catch (error) {
    console.error('Get room details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

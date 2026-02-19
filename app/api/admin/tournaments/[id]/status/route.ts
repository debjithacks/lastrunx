import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// PATCH /api/admin/tournaments/[id]/status - Update tournament status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { status } = await req.json()

    const validStatuses = ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Get tournament with registrations
    const tournament = await prisma.tournament.findUnique({
      where: { id },
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
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Validate status transitions
    if (status === 'LIVE') {
      // Check if minimum players requirement is met
      if (tournament._count.registrations < tournament.minPlayers) {
        return NextResponse.json(
          { error: `Cannot start tournament. Minimum ${tournament.minPlayers} players required, only ${tournament._count.registrations} registered` },
          { status: 400 }
        )
      }

      // Check if room details are set
      if (!tournament.roomId) {
        return NextResponse.json(
          { error: 'Cannot start tournament without room details. Please set room ID first' },
          { status: 400 }
        )
      }

      // Update registrations to PLAYING status
      await prisma.registration.updateMany({
        where: {
          tournamentId: id,
          paymentStatus: 'PAID'
        },
        data: {
          status: 'PLAYING'
        }
      })
    }

    if (status === 'COMPLETED' && tournament.status !== 'LIVE') {
      return NextResponse.json(
        { error: 'Can only mark LIVE tournaments as COMPLETED. Submit results instead.' },
        { status: 400 }
      )
    }

    // Update tournament status
    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        status,
        ...(status === 'LIVE' && { startTime: new Date() }),
        ...(status === 'COMPLETED' && { endTime: new Date() })
      }
    })

    // Log admin activity
    await logAdminActivity(
      session.user.id,
      'UPDATE_TOURNAMENT_STATUS',
      'Tournament',
      id,
      { 
        oldStatus: tournament.status,
        newStatus: status,
        registrations: tournament._count.registrations
      }
    )

    return NextResponse.json({
      message: `Tournament status updated to ${status}`,
      tournament: updatedTournament
    })
  } catch (error) {
    console.error('Update tournament status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// POST /api/admin/tournaments/[id]/room-details - Set/update room details
export async function POST(
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

    const { roomId, roomPassword } = await req.json()

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Prevent updates if tournament is completed
    if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot update room details for completed or cancelled tournament' },
        { status: 400 }
      )
    }

    // Update tournament with room details
    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        roomId,
        roomPassword: roomPassword || null
      }
    })

    // Log admin activity
    await logAdminActivity(
      session.user.id,
      'UPDATE_ROOM_DETAILS',
      'Tournament',
      id,
      { roomId, hasPassword: !!roomPassword }
    )

    return NextResponse.json({
      message: 'Room details updated successfully',
      tournament: updatedTournament
    })
  } catch (error) {
    console.error('Update room details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/tournaments/[id]/room-details - Get room details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        roomId: true,
        roomPassword: true,
        status: true,
        startTime: true
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      roomId: tournament.roomId,
      roomPassword: tournament.roomPassword,
      status: tournament.status,
      startTime: tournament.startTime
    })
  } catch (error) {
    console.error('Get room details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'
import { cancelTournamentTransaction } from '@/lib/transaction-manager'
import { logger, extractRequestContext } from '@/lib/logger'

// Helper function to check admin access
async function isAdmin(session: any) {
  if (!session || !session.user) {
    return false
  }
  
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER']
  return allowedRoles.includes(session.user.role)
}

// GET /api/admin/tournaments/[id] - Get single tournament details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phone: true,
              }
            }
          }
        },
        _count: {
          select: {
            registrations: true
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

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Get tournament error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/tournaments/[id] - Update tournament details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const data = await req.json()

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    })

    if (!existingTournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Prevent updates if tournament is LIVE or COMPLETED
    if (existingTournament.status === 'LIVE') {
      return NextResponse.json(
        { error: 'Cannot update a live tournament' },
        { status: 400 }
      )
    }

    if (existingTournament.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot update a completed tournament' },
        { status: 400 }
      )
    }

    // If reducing maxPlayers, check if it's less than current registrations
    if (data.maxPlayers && data.maxPlayers < existingTournament._count.registrations) {
      return NextResponse.json(
        { error: `Cannot reduce max players below current registrations (${existingTournament._count.registrations})` },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.image !== undefined) updateData.image = data.image
    if (data.entryFee !== undefined) updateData.entryFee = data.entryFee
    if (data.prizePool !== undefined) updateData.prizePool = data.prizePool
    if (data.maxPlayers !== undefined) updateData.maxPlayers = data.maxPlayers
    if (data.minPlayers !== undefined) updateData.minPlayers = data.minPlayers
    if (data.mode !== undefined) updateData.mode = data.mode
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime)
    if (data.endTime !== undefined) updateData.endTime = data.endTime ? new Date(data.endTime) : null
    if (data.rules !== undefined) updateData.rules = data.rules
    if (data.prizeDistribution !== undefined) updateData.prizeDistribution = data.prizeDistribution

    const tournament = await prisma.tournament.update({
      where: { id },
      data: updateData
    })

    // Log admin activity
    if (session?.user?.id) {
      await logAdminActivity(
        session.user.id,
        'UPDATE_TOURNAMENT',
        'Tournament',
        id,
        { updates: Object.keys(updateData) }
      )
    }

    return NextResponse.json({
      message: 'Tournament updated successfully',
      tournament
    })
  } catch (error) {
    console.error('Update tournament error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tournaments/[id] - Cancel tournament with refunds
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const requestContext = extractRequestContext(req)
  
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const context = {
      ...requestContext,
      adminId: session?.user?.id,
      tournamentId: id,
      action: 'CANCEL_TOURNAMENT'
    }

    logger.info('Tournament cancellation initiated', context)

    // Use transaction manager for atomic operations with refunds
    const { tournament, refundsProcessed, totalRefunded } = await cancelTournamentTransaction(id)

    const duration = Date.now() - startTime
    logger.tournamentEvent('Tournament cancelled successfully', id, {
      ...context,
      refundsProcessed,
      totalRefunded,
      duration
    })

    // Log admin activity
    if (session?.user?.id) {
      await logAdminActivity(
        session.user.id,
        'CANCEL_TOURNAMENT',
        'Tournament',
        id,
        { refundsProcessed, totalRefunded }
      )
    }

    return NextResponse.json({
      message: 'Tournament cancelled successfully',
      refundsProcessed,
      totalRefunded
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const { id } = await params

    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('Cannot cancel')) {
        logger.warn('Tournament cancellation failed - Business logic error', {
          ...requestContext,
          tournamentId: id,
          error: error.message,
          duration
        })
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes('not found') ? 404 : 400 }
        )
      }
    }

    logger.error('Tournament cancellation error', error as Error, {
      ...requestContext,
      tournamentId: id,
      duration
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

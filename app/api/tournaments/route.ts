import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const game = searchParams.get('game')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (game && game !== 'all') {
      where.game = game
    }
    
    if (status) {
      where.status = status
    } else {
      // By default, show only upcoming and live tournaments
      where.status = {
        in: ['UPCOMING', 'LIVE']
      }
    }

    const tournaments = await prisma.tournament.findMany({
      where,
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
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Transform data for frontend
    const transformedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      game: tournament.game,
      title: tournament.title,
      description: tournament.description,
      image: tournament.image,
      entryFee: tournament.entryFee.toString(),
      prizePool: tournament.prizePool.toString(),
      players: `${tournament._count.registrations}/${tournament.maxPlayers}`,
      currentPlayers: tournament._count.registrations,
      maxPlayers: tournament.maxPlayers,
      startTime: tournament.startTime,
      status: tournament.status,
      mode: tournament.mode,
      skill: '100% Skill'
    }))

    return NextResponse.json({ tournaments: transformedTournaments })
  } catch (error) {
    console.error('Tournaments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

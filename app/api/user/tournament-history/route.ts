import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/tournament-history - Get user's tournament history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const game = searchParams.get('game')

    const where: any = {
      userId: session.user.id,
      paymentStatus: 'PAID',
    }

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (game) {
      where.tournament = {
        game,
      }
    }

    const history = await prisma.registration.findMany({
      where,
      include: {
        tournament: {
          select: {
            id: true,
            game: true,
            title: true,
            image: true,
            entryFee: true,
            prizePool: true,
            startTime: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    const formatted = history.map(reg => ({
      id: reg.id,
      tournament: reg.tournament,
      registeredAt: reg.createdAt,
      status: reg.status,
      rank: reg.rank,
      kills: reg.kills,
      points: reg.points,
      winnings: reg.winnings?.toString() || '0',
      resultProof: reg.resultProof,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Get tournament history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

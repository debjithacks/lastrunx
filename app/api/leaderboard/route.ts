import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/leaderboard - Global leaderboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const game = searchParams.get('game') || 'all'
    const period = searchParams.get('period') || 'all' // all, month, week

    let startDate = new Date(0)
    if (period === 'month') {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === 'week') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
    }

    // Build where clause
    const where: any = {
      paymentStatus: 'PAID',
      createdAt: { gte: startDate },
    }

    if (game !== 'all') {
      where.tournament = {
        game,
      }
    }

    // Get top players by total winnings
    const leaderboard = await prisma.user.findMany({
      where: {
        registrations: {
          some: where,
        },
      },
      select: {
        id: true,
        username: true,
        registrations: {
          where,
          select: {
            winnings: true,
            rank: true,
            tournament: {
              select: {
                game: true,
              },
            },
          },
        },
      },
      take: 100,
    })

    // Calculate total winnings and tournament counts
    const rankings = leaderboard
      .map(user => {
        const totalWinnings = user.registrations.reduce(
          (sum, r) => sum + Number(r.winnings || 0),
          0
        )
        const tournamentsPlayed = user.registrations.length
        const wins = user.registrations.filter(r => r.rank === 1).length

        return {
          userId: user.id,
          username: user.username,
          totalWinnings,
          tournamentsPlayed,
          wins,
          winRate: tournamentsPlayed > 0 
            ? ((wins / tournamentsPlayed) * 100).toFixed(1)
            : '0.0',
        }
      })
      .filter(r => r.totalWinnings > 0)
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .slice(0, 50)
      .map((r, index) => ({
        rank: index + 1,
        ...r,
        totalWinnings: r.totalWinnings.toFixed(2),
      }))

    return NextResponse.json({
      period,
      game,
      leaderboard: rankings,
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

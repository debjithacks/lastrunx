import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/stats - Get user statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tournament statistics
    const [
      totalTournaments,
      completedTournaments,
      totalWinnings,
      totalSpent,
      bestRank,
    ] = await Promise.all([
      prisma.registration.count({
        where: { userId: session.user.id, paymentStatus: 'PAID' },
      }),
      prisma.registration.count({
        where: { userId: session.user.id, status: 'COMPLETED' },
      }),
      prisma.registration.aggregate({
        where: { userId: session.user.id },
        _sum: { winnings: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'TOURNAMENT_FEE',
          status: 'SUCCESS',
        },
        _sum: { amount: true },
      }),
      prisma.registration.aggregate({
        where: {
          userId: session.user.id,
          rank: { not: null },
        },
        _min: { rank: true },
      }),
    ])

    // Get game-wise statistics
    const gameStats = await prisma.$queryRaw<Array<{
      game: string
      tournaments: bigint
      wins: bigint
    }>>`
      SELECT 
        t.game,
        COUNT(*) as tournaments,
        COUNT(CASE WHEN r.rank = 1 THEN 1 END) as wins
      FROM "Registration" r
      JOIN "Tournament" t ON r."tournamentId" = t.id
      WHERE r."userId" = ${session.user.id}
        AND r."paymentStatus" = 'PAID'
      GROUP BY t.game
    `

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, kycVerified: true, createdAt: true },
    })

    return NextResponse.json({
      tournaments: {
        total: totalTournaments,
        completed: completedTournaments,
        winRate: completedTournaments > 0 
          ? ((Number(gameStats.reduce((sum, g) => sum + Number(g.wins), 0n)) / completedTournaments) * 100).toFixed(1)
          : '0.0',
      },
      earnings: {
        totalWinnings: totalWinnings._sum.winnings?.toString() || '0',
        totalSpent: totalSpent._sum.amount?.toString() || '0',
        netProfit: (
          Number(totalWinnings._sum.winnings || 0) - Number(totalSpent._sum.amount || 0)
        ).toFixed(2),
      },
      performance: {
        bestRank: bestRank._min.rank || null,
        gamesPlayed: gameStats.map(g => ({
          game: g.game,
          tournaments: Number(g.tournaments),
          wins: Number(g.wins),
        })),
      },
      account: {
        walletBalance: user?.walletBalance.toString() || '0',
        kycVerified: user?.kycVerified || false,
        memberSince: user?.createdAt,
      },
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

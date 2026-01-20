import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity, DEFAULT_PRIZE_DISTRIBUTION, calculatePrize } from '@/lib/admin-utils'

// POST /api/admin/tournaments/[id]/results - Submit tournament results
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { results } = body
    // results = [{ userId, rank, kills, points }, ...]

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: { registrations: true },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Get prize distribution or use default
    const prizeDistribution = tournament.prizeDistribution as any || 
      (tournament.maxPlayers <= 3 ? DEFAULT_PRIZE_DISTRIBUTION.TOP_3 :
       tournament.maxPlayers <= 5 ? DEFAULT_PRIZE_DISTRIBUTION.TOP_5 :
       DEFAULT_PRIZE_DISTRIBUTION.TOP_10)

    // Process results and distribute winnings
    const prizePool = Number(tournament.prizePool)
    
    await prisma.$transaction(async (tx) => {
      for (const result of results) {
        const { userId, rank, kills, points } = result
        
        // Calculate winnings
        const winnings = calculatePrize(rank, prizePool, prizeDistribution)

        // Update registration
        await tx.registration.updateMany({
          where: {
            tournamentId: params.id,
            userId,
          },
          data: {
            rank,
            kills,
            points,
            winnings,
            status: 'COMPLETED',
          },
        })

        // If user won, credit winnings
        if (winnings > 0) {
          await tx.user.update({
            where: { id: userId },
            data: {
              walletBalance: {
                increment: winnings,
              },
            },
          })

          // Create transaction
          await tx.transaction.create({
            data: {
              userId,
              type: 'TOURNAMENT_WINNING',
              amount: winnings,
              status: 'SUCCESS',
              description: `Winnings from ${tournament.title}`,
              metadata: { tournamentId: params.id, rank, kills, points },
            },
          })
        }
      }

      // Update tournament status
      await tx.tournament.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
        },
      })
    })

    await logAdminActivity(
      session.user.id,
      'SUBMIT_RESULTS',
      'Tournament',
      params.id,
      { resultsCount: results.length }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit results error:', error)
    return NextResponse.json(
      { error: 'Failed to submit results' },
      { status: 500 }
    )
  }
}

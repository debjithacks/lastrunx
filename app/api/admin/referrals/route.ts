import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger, extractRequestContext } from '@/lib/logger'

// GET /api/admin/referrals - View all referral activity
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId') || undefined

    // Get referral transactions
    const where = {
      type: 'REFERRAL_BONUS' as const,
      ...(userId && { userId })
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    // Get summary stats
    const summary = await prisma.transaction.aggregate({
      where: { type: 'REFERRAL_BONUS', status: 'SUCCESS' },
      _sum: {
        amount: true
      },
      _count: true
    })

    // Get top referrers
    const topReferrers = await prisma.$queryRaw<Array<{
      userId: string
      username: string
      totalReferrals: number
      totalEarnings: number
    }>>`
      SELECT 
        u.id as "userId",
        u.username,
        COUNT(DISTINCT t.id) as "totalReferrals",
        COALESCE(SUM(t.amount), 0) as "totalEarnings"
      FROM "User" u
      LEFT JOIN "Transaction" t ON t."userId" = u.id 
        AND t.type = 'REFERRAL_BONUS'
        AND t.status = 'SUCCESS'
      GROUP BY u.id, u.username
      HAVING COUNT(DISTINCT t.id) > 0
      ORDER BY "totalReferrals" DESC
      LIMIT 10
    `

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalReferrals: summary._count || 0,
        totalPaidOut: Number(summary._sum.amount || 0)
      },
      topReferrers
    })
  } catch (error) {
    const requestContext = extractRequestContext(req)
    logger.error('Get referrals error', error as Error, requestContext)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

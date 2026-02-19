import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserReferralStats, getUserReferralCode } from '@/lib/referral-system'
import { logger, extractRequestContext } from '@/lib/logger'

// GET /api/user/referral - Get user's referral information
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = await getUserReferralStats(session.user.id)

    return NextResponse.json({
      ...stats,
      config: {
        referrerBonus: 50,
        refereeBonus: 25,
        minDeposit: 100
      }
    })
  } catch (error) {
    const requestContext = extractRequestContext(req)
    logger.error('Get referral stats error', error as Error, requestContext)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

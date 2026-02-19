import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runFraudCheck } from '@/lib/fraud-detection'
import { logger, extractRequestContext } from '@/lib/logger'

// GET /api/admin/fraud/check/:userId - Run fraud check on specific user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { userId } = await params
    const result = await runFraudCheck(userId)

    // Log admin action
    logger.info('Fraud check performed', {
      adminId: session.user.id,
      targetUserId: userId,
      alertCount: result.alerts.length,
      riskLevel: result.riskScore.level
    })

    return NextResponse.json(result)
  } catch (error) {
    const requestContext = extractRequestContext(req)
    logger.error('Fraud check error', error as Error, requestContext)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

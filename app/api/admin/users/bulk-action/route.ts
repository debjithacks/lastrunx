import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger, extractRequestContext } from '@/lib/logger'
import { z } from 'zod'

const bulkUserActionSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
  action: z.enum(['BAN', 'UNBAN', 'VERIFY_KYC', 'REJECT_KYC', 'CLEAR_FINES']),
  reason: z.string().min(10).max(500).optional()
})

/**
 * POST /api/admin/users/bulk-action
 * Perform bulk actions on multiple users
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = bulkUserActionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { userIds, action, reason } = validation.data

    let updateData: any = {}
    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    // Perform the action
    switch (action) {
      case 'BAN':
        updateData = { banned: true, bannedAt: new Date() }
        break
      case 'UNBAN':
        updateData = { banned: false, bannedAt: null }
        break
      case 'VERIFY_KYC':
        updateData = { kycVerified: true, kycVerifiedAt: new Date() }
        break
      case 'REJECT_KYC':
        updateData = { kycVerified: false, kycVerifiedAt: null }
        break
      case 'CLEAR_FINES':
        // Handle separately
        break
    }

    if (action === 'CLEAR_FINES') {
      // Clear all active fines for selected users by marking as waived
      const result = await prisma.fine.updateMany({
        where: {
          userId: { in: userIds },
          status: 'ACTIVE'
        },
        data: {
          status: 'WAIVED'
        }
      })
      successCount = result.count
    } else {
      // Update users
      for (const userId of userIds) {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: updateData
          })
          successCount++
        } catch (error) {
          failCount++
          errors.push(`Failed to update user ${userId}`)
        }
      }
    }

    // Log admin action
    await prisma.adminActivity.create({
      data: {
        adminId: session.user.id,
        action: `BULK_${action}`,
        targetType: 'USER',
        targetId: userIds.join(','),
        details: {
          userIds,
          action,
          reason,
          successCount,
          failCount
        }
      }
    })

    logger.info('Bulk user action completed', {
      adminId: session.user.id,
      action,
      userCount: userIds.length,
      successCount,
      failCount
    })

    return NextResponse.json({
      success: true,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    const requestContext = extractRequestContext(req)
    logger.error('Bulk user action error', error as Error, requestContext)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

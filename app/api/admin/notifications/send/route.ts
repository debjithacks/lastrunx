import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity, getUsersForNotification, sendNotification } from '@/lib/admin-utils'

// POST /api/admin/notifications/send - Send notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, targetType, targetFilter } = body

    // Get target users
    const users = await getUsersForNotification(targetType, targetFilter)

    // Send notifications to all users
    const sendPromises = users.map(user =>
      sendNotification(
        { email: user.email, phone: user.phone || undefined },
        title,
        message
      )
    )

    await Promise.allSettled(sendPromises)

    // Log notification history
    const history = await prisma.notificationHistory.create({
      data: {
        title,
        message,
        targetType,
        targetFilter,
        sentBy: session.user.id,
        totalSent: users.length,
      },
    })

    await logAdminActivity(
      session.user.id,
      'SEND_NOTIFICATION',
      'NotificationHistory',
      history.id,
      { targetType, totalSent: users.length }
    )

    return NextResponse.json({
      success: true,
      totalSent: users.length,
      historyId: history.id,
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

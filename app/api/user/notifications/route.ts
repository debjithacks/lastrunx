import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/notifications - Get user's notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get notification history where user was a direct recipient
    const directNotifications = await prisma.notificationHistory.findMany({
      where: {
        recipientId: session.user.id
      },
      select: {
        id: true,
        title: true,
        message: true,
        sentAt: true,
        sender: {
          select: {
            username: true,
            role: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get bulk notifications that might apply to user
    // This is a simplified version - in production you'd want to filter based on targetFilter
    const bulkNotifications = await prisma.notificationHistory.findMany({
      where: {
        targetType: 'ALL_USERS',
        recipientId: null
      },
      select: {
        id: true,
        title: true,
        message: true,
        sentAt: true,
        sender: {
          select: {
            username: true,
            role: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: Math.floor(limit / 2),
      skip: 0
    })

    // Combine and sort by date
    const allNotifications = [...directNotifications, ...bulkNotifications]
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit)

    // Get total count
    const totalDirect = await prisma.notificationHistory.count({
      where: {
        recipientId: session.user.id
      }
    })

    return NextResponse.json({
      notifications: allNotifications,
      meta: {
        total: totalDirect,
        limit,
        offset,
        hasMore: totalDirect > offset + limit
      }
    })
  } catch (error) {
    console.error('Get user notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

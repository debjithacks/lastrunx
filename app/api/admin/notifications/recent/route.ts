import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/notifications/recent - Get recent admin notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session?.user || !adminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent admin activities
    const activities = await prisma.adminActivity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    })

    // Get recent disputes
    const recentDisputes = await prisma.dispute.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: {
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    })

    // Get recent tournaments
    const recentTournaments = await prisma.tournament.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    })

    // Format notifications
    const notifications = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registration',
        icon: 'user',
        title: 'New User Registration',
        message: `${user.username || user.email} signed up`,
        time: user.createdAt,
        link: `/admin/users?search=${user.email}`,
      })),
      ...recentDisputes.map(dispute => ({
        id: `dispute-${dispute.id}`,
        type: 'dispute',
        icon: 'alert-triangle',
        title: 'New Dispute Raised',
        message: `Dispute raised by ${dispute.user.username || dispute.user.email}`,
        time: dispute.createdAt,
        link: `/admin/disputes`,
      })),
      ...recentTournaments.map(tournament => ({
        id: `tournament-${tournament.id}`,
        type: 'tournament',
        icon: 'trophy',
        title: 'New Tournament Created',
        message: `"${tournament.title}" - ${tournament.status}`,
        time: tournament.createdAt,
        link: `/admin/tournaments?id=${tournament.id}`,
      })),
      ...activities.slice(0, 3).map(activity => ({
        id: `activity-${activity.id}`,
        type: 'activity',
        icon: 'activity',
        title: `Admin Activity: ${activity.action}`,
        message: activity.targetType ? `${activity.targetType} modified` : 'System action',
        time: activity.createdAt,
        link: `/admin/logs`,
      })),
    ]

    // Sort by time and limit to 10
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const limitedNotifications = notifications.slice(0, 10)

    return NextResponse.json({
      notifications: limitedNotifications,
      unreadCount: recentDisputes.length,
    })
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

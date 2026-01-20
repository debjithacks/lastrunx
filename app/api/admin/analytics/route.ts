import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// GET /api/admin/analytics - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today' // today, week, month, all

    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      default:
        startDate = new Date(0) // All time
    }

    // Revenue Analytics
    const deposits = await prisma.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    })

    const withdrawals = await prisma.transaction.aggregate({
      where: {
        type: 'WITHDRAWAL',
        status: 'SUCCESS',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    })

    const tournamentFees = await prisma.transaction.aggregate({
      where: {
        type: 'TOURNAMENT_FEE',
        status: 'SUCCESS',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    })

    const fines = await prisma.transaction.aggregate({
      where: {
        type: 'FINE',
        status: 'SUCCESS',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    })

    const promotionalExpense = await prisma.transaction.aggregate({
      where: {
        type: 'PROMOTIONAL_EXPENSE',
        status: 'SUCCESS',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    })

    // User Analytics
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: {
        lastActive: { gte: startDate },
      },
    })

    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    const kycPending = await prisma.user.count({
      where: {
        kycVerified: false,
        kycDocuments: { not: null },
      },
    })

    // Tournament Analytics
    const totalTournaments = await prisma.tournament.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    const liveTournaments = await prisma.tournament.count({
      where: { status: 'LIVE' },
    })

    const completedTournaments = await prisma.tournament.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
    })

    const tournamentRegistrations = await prisma.registration.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Revenue by game
    const revenueByGame = await prisma.tournament.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
      select: {
        game: true,
        entryFee: true,
        _count: {
          select: { registrations: true },
        },
      },
    })

    const gameRevenue = revenueByGame.reduce((acc: any, tournament) => {
      const revenue = Number(tournament.entryFee) * tournament._count.registrations
      acc[tournament.game] = (acc[tournament.game] || 0) + revenue
      return acc
    }, {})

    // Pending disputes
    const pendingDisputes = await prisma.dispute.count({
      where: { status: 'PENDING' },
    })

    const analytics = {
      revenue: {
        totalDeposits: Number(deposits._sum.amount || 0),
        totalWithdrawals: Number(withdrawals._sum.amount || 0),
        tournamentFees: Number(tournamentFees._sum.amount || 0),
        fines: Number(fines._sum.amount || 0),
        promotionalExpense: Number(promotionalExpense._sum.amount || 0),
        netRevenue:
          Number(deposits._sum.amount || 0) +
          Number(tournamentFees._sum.amount || 0) +
          Number(fines._sum.amount || 0) -
          Number(withdrawals._sum.amount || 0) -
          Number(promotionalExpense._sum.amount || 0),
        depositCount: deposits._count,
        withdrawalCount: withdrawals._count,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        kycPending,
      },
      tournaments: {
        total: totalTournaments,
        live: liveTournaments,
        completed: completedTournaments,
        registrations: tournamentRegistrations,
      },
      gameRevenue,
      pendingDisputes,
    }

    await logAdminActivity(
      session.user.id,
      'VIEW_ANALYTICS',
      'Analytics',
      undefined,
      { period }
    )

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

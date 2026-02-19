import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// GET /api/admin/tournaments/[id]/registrations - Get all registrations for a tournament
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query params for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    // Build where clause
    const where: any = { tournamentId: id }
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            kycVerified: true,
            walletBalance: true
          }
        }
      },
      orderBy: [
        { rank: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    // Get tournament details
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        title: true,
        game: true,
        status: true,
        maxPlayers: true,
        startTime: true
      }
    })

    return NextResponse.json({
      tournament,
      registrations,
      count: registrations.length
    })
  } catch (error) {
    console.error('Get registrations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

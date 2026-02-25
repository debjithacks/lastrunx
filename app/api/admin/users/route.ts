import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Admin users API - Session:', session ? { role: session.user.role, email: session.user.email } : 'No session')
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      console.log('Unauthorized access attempt to admin users')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const kycStatus = searchParams.get('kycStatus')

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    if (role) where.role = role
    if (kycStatus === 'verified') where.kycVerified = true
    if (kycStatus === 'unverified') where.kycVerified = false

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        walletBalance: true,
        role: true,
        kycVerified: true,
        isActive: true,
        lastActive: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            transactions: true,
            fines: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// GET /api/admin/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        gameProfiles: true,
        registrations: {
          include: {
            tournament: {
              select: {
                id: true,
                title: true,
                game: true,
                startTime: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        fines: {
          include: {
            dispute: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Fetch user error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, kycVerified } = body

    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive,
        kycVerified,
      },
    })

    await logAdminActivity(
      session.user.id,
      'UPDATE_USER',
      'User',
      user.id,
      { changes: body }
    )

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

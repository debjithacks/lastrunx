import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// GET /api/admin/kyc - Get pending KYC requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'

    const where: any = {}
    
    if (status === 'pending') {
      where.kycVerified = false
      where.kycDocuments = { not: null }
    } else if (status === 'verified') {
      where.kycVerified = true
    } else if (status === 'not_submitted') {
      where.kycDocuments = null
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        kycVerified: true,
        kycDocuments: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    await logAdminActivity(
      session.user.id,
      'VIEW_KYC_REQUESTS',
      'KYC',
      JSON.stringify({ status })
    )

    return NextResponse.json(users)
  } catch (error) {
    console.error('Get KYC requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

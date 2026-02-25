import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/admin/kyc/pending - Get all pending KYC submissions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'pending', 'verified', 'rejected'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      kycDocuments: {
        not: null
      }
    }

    if (status === 'pending') {
      where.kycVerified = false
    } else if (status === 'verified') {
      where.kycVerified = true
    }
    // For 'rejected', we'd need to add a separate field in schema, 
    // but for now we'll just show non-verified with documents

    // Get users with KYC documents
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
        updatedAt: true,
        walletBalance: true,
        _count: {
          select: {
            registrations: true,
            transactions: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get total count
    const total = await prisma.user.count({ where })

    // Get summary stats
    const totalPending = await prisma.user.count({
      where: {
        kycDocuments: { not: Prisma.JsonNull },
        kycVerified: false
      }
    })

    const totalVerified = await prisma.user.count({
      where: {
        kycVerified: true
      }
    })

    return NextResponse.json({
      users,
      meta: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit
      },
      summary: {
        totalPending,
        totalVerified,
        totalWithDocuments: totalPending + totalVerified
      }
    })
  } catch (error) {
    console.error('Get pending KYC error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

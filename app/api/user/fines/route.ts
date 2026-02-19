import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/fines - Get user's fines
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
    const status = searchParams.get('status')

    // Build where clause
    const where: any = { userId: session.user.id }
    if (status) where.status = status

    const fines = await prisma.fine.findMany({
      where,
      include: {
        dispute: {
          select: {
            id: true,
            status: true,
            justification: true,
            createdAt: true,
            reviewedAt: true,
            reviewNotes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate totals
    const activeFines = fines.filter(f => f.status === 'ACTIVE')
    const totalActive = activeFines.reduce((sum, fine) => sum + Number(fine.amount), 0)
    const totalPaid = fines.filter(f => f.status === 'PAID').reduce((sum, fine) => sum + Number(fine.amount), 0)

    return NextResponse.json({
      fines,
      summary: {
        total: fines.length,
        active: activeFines.length,
        disputed: fines.filter(f => f.status === 'DISPUTED').length,
        paid: fines.filter(f => f.status === 'PAID').length,
        waived: fines.filter(f => f.status === 'WAIVED').length,
        totalActive,
        totalPaid
      }
    })
  } catch (error) {
    console.error('Get user fines error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

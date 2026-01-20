import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity, generateCouponCode } from '@/lib/admin-utils'

// GET /api/admin/coupons - List all coupons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        usages: {
          select: {
            userId: true,
            discount: true,
            usedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Fetch coupons error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/admin/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      discountType,
      discountValue,
      scope,
      gameType,
      tournamentId,
      minAmount,
      maxDiscount,
      usageLimit,
      validUntil,
    } = body

    // Generate unique coupon code
    let code = generateCouponCode(8)
    let exists = await prisma.coupon.findUnique({ where: { code } })
    
    while (exists) {
      code = generateCouponCode(8)
      exists = await prisma.coupon.findUnique({ where: { code } })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        discountType,
        discountValue: parseFloat(discountValue),
        scope,
        gameType,
        tournamentId,
        minAmount: minAmount ? parseFloat(minAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validUntil: new Date(validUntil),
      },
    })

    await logAdminActivity(
      session.user.id,
      'CREATE_COUPON',
      'Coupon',
      coupon.id,
      { code: coupon.code }
    )

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Create coupon error:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}

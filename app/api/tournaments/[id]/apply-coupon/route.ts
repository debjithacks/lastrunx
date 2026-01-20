import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/tournaments/[id]/apply-coupon - Apply coupon
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await req.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    // Validate coupon
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Coupon is inactive' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json(
        { error: 'Coupon not yet valid' },
        { status: 400 }
      )
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return NextResponse.json(
        { error: 'Coupon has expired' },
        { status: 400 }
      )
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Coupon usage limit reached' },
        { status: 400 }
      )
    }

    // Get tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Validate coupon scope
    if (coupon.scope === 'GAME_SPECIFIC' && coupon.gameType !== tournament.game) {
      return NextResponse.json(
        { error: `Coupon is only valid for ${coupon.gameType}` },
        { status: 400 }
      )
    }

    if (coupon.scope === 'TOURNAMENT_SPECIFIC' && coupon.tournamentId !== params.id) {
      return NextResponse.json(
        { error: 'Coupon is not valid for this tournament' },
        { status: 400 }
      )
    }

    // Check minimum amount
    if (coupon.minAmount && tournament.entryFee.lt(coupon.minAmount)) {
      return NextResponse.json(
        { error: `Minimum entry fee of ₹${coupon.minAmount} required` },
        { status: 400 }
      )
    }

    // Check if user already used this coupon
    const existingUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: session.user.id,
      },
    })

    if (existingUsage) {
      return NextResponse.json(
        { error: 'You have already used this coupon' },
        { status: 400 }
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Number(tournament.entryFee) * (Number(coupon.discountValue) / 100)
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount)
      }
    } else {
      discount = Number(coupon.discountValue)
    }

    const finalAmount = Math.max(0, Number(tournament.entryFee) - discount)

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
      },
      discount: discount.toFixed(2),
      originalAmount: tournament.entryFee.toString(),
      finalAmount: finalAmount.toFixed(2),
    })
  } catch (error) {
    console.error('Apply coupon error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

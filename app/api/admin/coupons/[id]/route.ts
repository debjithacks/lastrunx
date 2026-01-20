import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// PUT /api/admin/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, validUntil, usageLimit } = body

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        isActive,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      },
    })

    await logAdminActivity(
      session.user.id,
      'UPDATE_COUPON',
      'Coupon',
      coupon.id,
      { changes: body }
    )

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Update coupon error:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.coupon.delete({
      where: { id: params.id },
    })

    await logAdminActivity(
      session.user.id,
      'DELETE_COUPON',
      'Coupon',
      params.id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete coupon error:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}

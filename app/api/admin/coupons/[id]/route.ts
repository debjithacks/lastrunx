import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// PUT /api/admin/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { isActive, validUntil, usageLimit } = body

    const coupon = await prisma.coupon.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']
    if (!session || !adminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.coupon.delete({
      where: { id },
    })

    await logAdminActivity(
      session.user.id,
      'DELETE_COUPON',
      'Coupon',
      id
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

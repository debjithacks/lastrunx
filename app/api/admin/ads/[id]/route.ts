import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/ads/[id] - Update ad
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await prisma.ad.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    // Validate dates if provided
    const startDate = body.startDate ? new Date(body.startDate) : existing.startDate
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : existing.expiryDate

    if (expiryDate <= startDate) {
      return NextResponse.json({ error: 'Expiry date must be after start date' }, { status: 400 })
    }

    // Check for priority conflicts if priority is being changed
    if (body.priority && body.priority !== existing.priority) {
      const conflict = await prisma.ad.findFirst({
        where: {
          id: { not: id },
          placement: body.placement || existing.placement,
          priority: body.priority,
          isActive: true,
        },
      })

      if (conflict) {
        return NextResponse.json(
          { error: `Priority ${body.priority} is already in use` },
          { status: 400 }
        )
      }
    }

    const ad = await prisma.ad.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Update ad error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/ads/[id] - Delete ad
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.ad.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    await prisma.ad.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete ad error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

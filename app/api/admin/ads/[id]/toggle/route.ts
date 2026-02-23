import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/ads/[id]/toggle - Toggle ad active status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const existing = await prisma.ad.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    const ad = await prisma.ad.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Toggle ad error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

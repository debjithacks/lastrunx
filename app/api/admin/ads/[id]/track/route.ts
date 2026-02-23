import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/ads/[id]/track - Track impressions/clicks
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type } = body // 'impression' or 'click'

    const ad = await prisma.ad.findUnique({
      where: { id },
    })

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    // Check if ad has reached max impressions
    if (type === 'impression' && ad.maxImpressions && ad.impressions >= ad.maxImpressions) {
      return NextResponse.json({ error: 'Max impressions reached' }, { status: 400 })
    }

    const updateData: any = {}
    
    if (type === 'impression') {
      updateData.impressions = ad.impressions + 1
    } else if (type === 'click') {
      updateData.clicks = ad.clicks + 1
    }

    await prisma.ad.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track ad error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

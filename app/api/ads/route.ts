import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/ads?placement=HERO - Get active ads for public display
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const placement = searchParams.get('placement')
    const device = searchParams.get('device') || 'ALL'

    if (!placement) {
      return NextResponse.json({ error: 'Placement is required' }, { status: 400 })
    }

    const now = new Date()

    const where: any = {
      placement,
      isActive: true,
      startDate: { lte: now },
      expiryDate: { gte: now },
      OR: [
        { deviceTarget: 'ALL' },
        { deviceTarget: device },
      ],
    }

    // Filter out ads that have reached max impressions
    const ads = await prisma.ad.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        mediaUrl: true,
        mediaType: true,
        placement: true,
        redirectUrl: true,
        openInNewTab: true,
        priority: true,
        impressions: true,
        maxImpressions: true,
      },
    })

    // Filter out ads that have reached max impressions
    const filteredAds = ads.filter(ad => {
      if (ad.maxImpressions && ad.impressions >= ad.maxImpressions) {
        return false
      }
      return true
    })

    return NextResponse.json(
      { ads: filteredAds },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Get public ads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

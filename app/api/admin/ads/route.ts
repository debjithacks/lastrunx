import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/ads - List all ads with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const placement = searchParams.get('placement')
    const search = searchParams.get('search')
    const expired = searchParams.get('expired')
    const hidden = searchParams.get('hidden')

    const skip = (page - 1) * limit

    const where: any = {}

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (placement) {
      where.placement = placement
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      }
    }

    if (expired === 'true') {
      where.expiryDate = {
        lt: new Date(),
      }
    } else if (expired === 'false') {
      where.expiryDate = {
        gte: new Date(),
      }
    }

    if (hidden === 'visible') {
      where.isHidden = false
    } else if (hidden === 'hidden') {
      where.isHidden = true
    }

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.ad.count({ where }),
    ])

    return NextResponse.json({
      ads,
      total,
      totalPages: Math.ceil(total / limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get ads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/ads - Create new ad
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      mediaUrl,
      mediaType,
      placement,
      redirectUrl,
      openInNewTab,
      priority,
      isActive,
      startDate,
      expiryDate,
      deviceTarget,
      maxImpressions,
    } = body

    // Validation
    if (!title || !mediaUrl || !mediaType || !placement || !startDate || !expiryDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (new Date(expiryDate) <= new Date(startDate)) {
      return NextResponse.json({ error: 'Expiry date must be after start date' }, { status: 400 })
    }

    // Check for priority conflicts
    if (priority) {
      const existing = await prisma.ad.findFirst({
        where: {
          placement,
          priority,
          isActive: true,
          NOT: {
            expiryDate: {
              lt: new Date(startDate),
            },
          },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: `Priority ${priority} is already in use for ${placement} placement` },
          { status: 400 }
        )
      }
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        mediaUrl,
        mediaType,
        placement,
        redirectUrl,
        openInNewTab: openInNewTab ?? true,
        priority: priority ?? 0,
        isActive: isActive ?? true,
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        deviceTarget: deviceTarget ?? 'ALL',
        maxImpressions,
      },
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Create ad error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

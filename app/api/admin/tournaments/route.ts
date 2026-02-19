import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Admin middleware
async function isAdmin(session: any) {
  if (!session || !session.user) {
    return false
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  return user?.role === 'ADMIN'
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Admin tournaments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const data = await req.json()

    // Validate required fields
    if (!data.game || !data.title || !data.image || 
        data.entryFee === undefined || data.prizePool === undefined ||
        !data.maxPlayers || !data.mode || !data.startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const startTime = new Date(data.startTime)
    if (startTime < new Date()) {
      return NextResponse.json(
        { error: 'Start time must be in the future' },
        { status: 400 }
      )
    }

    const tournament = await prisma.tournament.create({
      data: {
        game: data.game,
        title: data.title,
        description: data.description,
        image: data.image,
        entryFee: data.entryFee,
        prizePool: data.prizePool,
        maxPlayers: data.maxPlayers,
        minPlayers: data.minPlayers || 2,
        mode: data.mode,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        rules: data.rules || null,
        prizeDistribution: data.prizeDistribution || null,
        status: data.status || 'UPCOMING'
      }
    })

    return NextResponse.json(
      { 
        message: 'Tournament created successfully',
        tournament 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin tournament create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/game-profiles - Get user's game profiles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profiles = await prisma.gameProfile.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Get game profiles error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user/game-profiles - Add new game profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameName, inGameId, inGameUsername } = await req.json()

    if (!gameName || !inGameId || !inGameUsername) {
      return NextResponse.json(
        { error: 'Game name, in-game ID, and username are required' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const existing = await prisma.gameProfile.findUnique({
      where: {
        userId_gameName: {
          userId: session.user.id,
          gameName,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Game profile already exists for this game' },
        { status: 400 }
      )
    }

    const profile = await prisma.gameProfile.create({
      data: {
        userId: session.user.id,
        gameName,
        inGameId,
        inGameUsername,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Create game profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

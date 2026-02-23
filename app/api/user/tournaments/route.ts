import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's tournament registrations
    const registrations = await prisma.registration.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tournament: {
          select: {
            id: true,
            title: true,
            game: true,
            image: true,
            entryFee: true,
            prizePool: true,
            maxPlayers: true,
            startTime: true,
            status: true,
            mode: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      registrations
    })
  } catch (error) {
    console.error('Failed to fetch user tournaments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

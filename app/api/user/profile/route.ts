import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Profile API - Session:', session)

    if (!session || !session.user) {
      console.log('Profile API - No session or user')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    console.log('Profile API - User ID:', session.user.id)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        phoneVerified: true,
        walletBalance: true,
        role: true,
        kycVerified: true,
        createdAt: true,
        gameProfiles: {
          select: {
            id: true,
            gameName: true,
            inGameId: true,
            inGameUsername: true,
            verified: true,
          }
        },
        _count: {
          select: {
            registrations: true,
            transactions: true,
          }
        }
      }
    })

    console.log('Profile API - User found:', !!user)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { phone, username } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(phone && { phone }),
        ...(username && { username }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        walletBalance: true,
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

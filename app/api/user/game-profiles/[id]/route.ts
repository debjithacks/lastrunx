import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/user/game-profiles/[id] - Update game profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inGameId, inGameUsername } = await req.json()

    const profile = await prisma.gameProfile.findUnique({
      where: { id: params.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Game profile not found' },
        { status: 404 }
      )
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.gameProfile.update({
      where: { id: params.id },
      data: {
        ...(inGameId && { inGameId }),
        ...(inGameUsername && { inGameUsername }),
        verified: false, // Reset verification on update
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update game profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/game-profiles/[id] - Delete game profile
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.gameProfile.findUnique({
      where: { id: params.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Game profile not found' },
        { status: 404 }
      )
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.gameProfile.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Game profile deleted successfully' })
  } catch (error) {
    console.error('Delete game profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

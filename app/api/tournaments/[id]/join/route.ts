import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: {
              where: { paymentStatus: 'PAID' }
            }
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check if tournament is full
    if (tournament._count.registrations >= tournament.maxPlayers) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      )
    }

    // Check if user already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_tournamentId: {
          userId: session.user.id,
          tournamentId: params.id
        }
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this tournament' },
        { status: 400 }
      )
    }

    // Check user wallet balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.walletBalance.lt(tournament.entryFee)) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      )
    }

    // Create registration and deduct from wallet
    const registration = await prisma.$transaction(async (tx) => {
      // Deduct entry fee from wallet
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: {
            decrement: tournament.entryFee
          }
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'TOURNAMENT_FEE',
          amount: tournament.entryFee,
          status: 'SUCCESS',
          description: `Entry fee for ${tournament.title}`
        }
      })

      // Create registration
      return tx.registration.create({
        data: {
          userId: session.user.id,
          tournamentId: params.id,
          paymentStatus: 'PAID',
          status: 'REGISTERED'
        },
        include: {
          tournament: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })
    })

    return NextResponse.json(
      { 
        message: 'Successfully registered for tournament',
        registration 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Tournament join error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

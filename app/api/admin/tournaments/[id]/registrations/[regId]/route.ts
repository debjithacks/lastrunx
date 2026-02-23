import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// PATCH /api/admin/tournaments/[id]/registrations/[regId] - Update registration
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  try {
    const { id: tournamentId, regId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const data = await req.json()

    // Check if registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: regId },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        },
        tournament: {
          select: {
            title: true,
            status: true
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (registration.tournamentId !== tournamentId) {
      return NextResponse.json(
        { error: 'Registration does not belong to this tournament' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (data.verifiedInRoom !== undefined) {
      updateData.verifiedInRoom = data.verifiedInRoom
    }
    
    if (data.status !== undefined) {
      const validStatuses = ['REGISTERED', 'PLAYING', 'COMPLETED', 'DISQUALIFIED']
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = data.status
    }

    if (data.inGameId !== undefined) {
      updateData.inGameId = data.inGameId
    }

    if (data.inGameUsername !== undefined) {
      updateData.inGameUsername = data.inGameUsername
    }

    // Update registration
    const updatedRegistration = await prisma.registration.update({
      where: { id: regId },
      data: updateData
    })

    // Log admin activity
    await logAdminActivity(
      session.user.id,
      'UPDATE_REGISTRATION',
      'Registration',
      regId,
      { 
        tournamentId,
        userId: registration.userId,
        updates: Object.keys(updateData)
      }
    )

    return NextResponse.json({
      message: 'Registration updated successfully',
      registration: updatedRegistration
    })
  } catch (error) {
    console.error('Update registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tournaments/[id]/registrations/[regId] - Disqualify/kick participant
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  try {
    const { id: tournamentId, regId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { reason, refund } = await req.json()

    // Get registration with details
    const registration = await prisma.registration.findUnique({
      where: { id: regId },
      include: {
        tournament: true,
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (registration.tournamentId !== tournamentId) {
      return NextResponse.json(
        { error: 'Registration does not belong to this tournament' },
        { status: 400 }
      )
    }

    // Cannot disqualify if tournament already completed
    if (registration.tournament.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot disqualify from a completed tournament' },
        { status: 400 }
      )
    }

    // Process in transaction
    await prisma.$transaction(async (tx) => {
      // Update registration to disqualified
      await tx.registration.update({
        where: { id: regId },
        data: {
          status: 'DISQUALIFIED'
        }
      })

      // Process refund if requested and payment was made
      if (refund && registration.paymentStatus === 'PAID') {
        await tx.user.update({
          where: { id: registration.userId },
          data: {
            walletBalance: {
              increment: registration.tournament.entryFee
            }
          }
        })

        await tx.transaction.create({
          data: {
            userId: registration.userId,
            type: 'REFUND',
            amount: registration.tournament.entryFee,
            status: 'SUCCESS',
            description: `Refund for disqualification: ${registration.tournament.title}`,
            reason: reason || 'Disqualified by admin',
            metadata: {
              tournamentId,
              registrationId: regId
            }
          }
        })

        await tx.registration.update({
          where: { id: regId },
          data: {
            paymentStatus: 'REFUNDED'
          }
        })
      }
    })

    // Log admin activity
    await logAdminActivity(
      session.user.id,
      'DISQUALIFY_PARTICIPANT',
      'Registration',
      regId,
      { 
        tournamentId,
        userId: registration.userId,
        reason: reason || 'No reason provided',
        refunded: refund && registration.paymentStatus === 'PAID'
      }
    )

    return NextResponse.json({
      message: 'Participant disqualified successfully',
      refunded: refund && registration.paymentStatus === 'PAID'
    })
  } catch (error) {
    console.error('Disqualify participant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

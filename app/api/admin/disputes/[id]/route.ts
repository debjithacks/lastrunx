import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity, sendNotification } from '@/lib/admin-utils'

// PUT /api/admin/disputes/[id] - Review dispute
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, reviewNotes } = body

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        fine: true,
        user: true,
      },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Update dispute and fine in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedDispute = await tx.dispute.update({
        where: { id },
        data: {
          status,
          reviewNotes,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      })

      // If approved, waive the fine and refund
      if (status === 'APPROVED') {
        await tx.fine.update({
          where: { id: dispute.fineId },
          data: { status: 'WAIVED' },
        })

        // Refund to wallet
        await tx.user.update({
          where: { id: dispute.userId },
          data: {
            walletBalance: {
              increment: dispute.fine.amount,
            },
          },
        })

        // Create refund transaction
        await tx.transaction.create({
          data: {
            userId: dispute.userId,
            type: 'REFUND',
            amount: dispute.fine.amount,
            status: 'SUCCESS',
            description: 'Fine waived - dispute approved',
            reason: reviewNotes,
          },
        })
      } else if (status === 'REJECTED') {
        await tx.fine.update({
          where: { id: dispute.fineId },
          data: { status: 'PAID' },
        })
      }

      return updatedDispute
    })

    // Send notification
    const message = status === 'APPROVED'
      ? `Your dispute has been approved. Fine of ₹${dispute.fine.amount} has been refunded to your wallet.`
      : `Your dispute has been rejected. Reason: ${reviewNotes}`

    await sendNotification(
      { email: dispute.user.email, phone: dispute.user.phone || undefined },
      'Dispute Review',
      message
    )

    await logAdminActivity(
      session.user.id,
      'REVIEW_DISPUTE',
      'Dispute',
      id,
      { status, reviewNotes }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Review dispute error:', error)
    return NextResponse.json(
      { error: 'Failed to review dispute' },
      { status: 500 }
    )
  }
}

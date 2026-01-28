import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity } from '@/lib/admin-utils'

// PUT /api/admin/withdrawals/[id] - Approve/reject withdrawal
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, remarks } = await req.json()

    if (!['SUCCESS', 'FAILED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be SUCCESS or FAILED' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.type !== 'WITHDRAWAL') {
      return NextResponse.json(
        { error: 'Not a withdrawal transaction' },
        { status: 400 }
      )
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      )
    }

    // Process withdrawal
    const updated = await prisma.$transaction(async (tx) => {
      // If failed, refund to wallet
      if (status === 'FAILED') {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            walletBalance: {
              increment: transaction.amount,
            },
          },
        })
      }

      // Update transaction
      return tx.transaction.update({
        where: { id },
        data: {
          status,
          reason: remarks,
        },
      })
    })

    await logAdminActivity(
      session.user.id,
      status === 'SUCCESS' ? 'APPROVE_WITHDRAWAL' : 'REJECT_WITHDRAWAL',
      'WITHDRAWAL',
      id,
      {
        userId: transaction.userId,
        amount: transaction.amount.toString(),
        remarks,
      }
    )

    return NextResponse.json({
      message: `Withdrawal ${status === 'SUCCESS' ? 'approved' : 'rejected'} successfully`,
      transaction: updated,
    })
  } catch (error) {
    console.error('Process withdrawal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

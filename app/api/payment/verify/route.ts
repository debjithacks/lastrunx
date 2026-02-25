import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { joinTournamentTransaction } from '@/lib/transaction-manager'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update transaction and add to wallet
    const transaction = await prisma.transaction.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
        userId: session.user.id
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction and add to wallet in a transaction
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }
      })

      // If DEPOSIT, add to wallet
      if (transaction.type === 'DEPOSIT') {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            walletBalance: {
              increment: transaction.amount
            }
          }
        })
      }
    })

    // If TOURNAMENT_FEE, join the tournament
    if (transaction.type === 'TOURNAMENT_FEE' && transaction.metadata && typeof transaction.metadata === 'object' && !Array.isArray(transaction.metadata) && 'tournamentId' in transaction.metadata) {
      const tournamentId = (transaction.metadata as { tournamentId: string }).tournamentId
      
      try {
        await joinTournamentTransaction(
          session.user.id,
          tournamentId,
          'online',
          razorpay_payment_id
        )
      } catch (error) {
        console.error('Tournament join error after payment:', error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to join tournament after payment' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      message: 'Payment verified successfully',
      amount: transaction.amount,
      type: transaction.type
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

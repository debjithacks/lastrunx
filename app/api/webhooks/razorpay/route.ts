import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/webhooks/razorpay - Razorpay webhook handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    // Handle payment events
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity

      // Find transaction by order ID
      const transaction = await prisma.transaction.findFirst({
        where: {
          razorpayOrderId: payment.order_id,
          status: 'PENDING',
        },
      })

      if (transaction) {
        // Update transaction and wallet
        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'SUCCESS',
              razorpayPaymentId: payment.id,
            },
          })

          await tx.user.update({
            where: { id: transaction.userId },
            data: {
              walletBalance: {
                increment: transaction.amount,
              },
            },
          })
        })
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity

      // Mark transaction as failed
      await prisma.transaction.updateMany({
        where: {
          razorpayOrderId: payment.order_id,
          status: 'PENDING',
        },
        data: {
          status: 'FAILED',
          razorpayPaymentId: payment.id,
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

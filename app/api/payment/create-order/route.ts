import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { razorpay } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Minimum deposit amount is ₹100' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const order = await razorpay().orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `deposit_${session.user.id}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        type: 'DEPOSIT'
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'DEPOSIT',
        amount: amount,
        status: 'PENDING',
        razorpayOrderId: order.id,
        description: `Wallet deposit of ₹${amount}`
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

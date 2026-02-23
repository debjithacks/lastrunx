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

    const { amount, type, tournamentId } = await req.json()

    // Convert amount to number if it's a string
    const amountNum = Number(amount)

    if (!amountNum || amountNum < 1 || isNaN(amountNum)) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    const paymentType = type || 'DEPOSIT'
    // Razorpay receipt must be max 40 chars
    const typeShort = paymentType === 'TOURNAMENT_FEE' ? 'TF' : 'DEP'
    const userIdShort = session.user.id.slice(-8) // Last 8 chars of user ID
    const timestamp = Date.now().toString().slice(-10) // Last 10 digits
    const receipt = `${typeShort}_${userIdShort}_${timestamp}`

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Create Razorpay order
    const order = await razorpay().orders.create({
      amount: Math.round(amountNum * 100), // Convert to paise and round
      currency: 'INR',
      receipt,
      notes: {
        userId: session.user.id,
        type: paymentType,
        ...(tournamentId && { tournamentId })
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: paymentType,
        amount: amountNum,
        status: 'PENDING',
        razorpayOrderId: order.id,
        description: paymentType === 'TOURNAMENT_FEE' 
          ? `Tournament entry fee of ₹${amountNum}`
          : `Wallet deposit of ₹${amountNum}`,
        metadata: tournamentId ? { tournamentId } : undefined
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
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Check if it's a Razorpay error
    if (error && typeof error === 'object' && 'error' in error) {
      const razorpayError = error as any
      console.error('Razorpay error details:', razorpayError.error)
      return NextResponse.json(
        { error: razorpayError.error?.description || 'Failed to create payment order' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment order. Please try again or contact support.' },
      { status: 500 }
    )
  }
}

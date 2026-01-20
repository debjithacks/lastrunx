import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/user/withdraw - Request withdrawal
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, upiId, accountNumber, ifsc, accountName } = await req.json()

    // Validate amount
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is ₹100' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check KYC
    if (!user.kycVerified) {
      return NextResponse.json(
        { error: 'KYC verification required for withdrawals' },
        { status: 403 }
      )
    }

    // Check balance
    if (user.walletBalance.lt(amount)) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      )
    }

    // Create withdrawal transaction in atomic operation
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: {
            decrement: amount,
          },
        },
      })

      // Create transaction record
      return tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'WITHDRAWAL',
          amount,
          status: 'PENDING',
          description: `Withdrawal request to ${upiId || accountNumber}`,
          metadata: {
            upiId,
            accountNumber,
            ifsc,
            accountName,
          },
        },
      })
    })

    return NextResponse.json(
      {
        message: 'Withdrawal request submitted successfully',
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount.toString(),
          status: withdrawal.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminActivity, sendNotification } from '@/lib/admin-utils'

// POST /api/admin/users/[id]/fine - Issue a fine to user
export async function POST(
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
    const { amount, reason, evidence, tournamentId } = body

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create fine and transaction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create fine
      const fine = await tx.fine.create({
        data: {
          userId: id,
          amount: parseFloat(amount),
          reason,
          evidence,
          tournamentId,
        },
      })

      // Deduct from wallet
      await tx.user.update({
        where: { id },
        data: {
          walletBalance: {
            decrement: parseFloat(amount),
          },
        },
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: id,
          type: 'FINE',
          amount: parseFloat(amount),
          status: 'SUCCESS',
          description: 'Fine issued by admin',
          reason,
        },
      })

      return { fine, transaction }
    })

    // Send notification to user
    await sendNotification(
      { email: user.email, phone: user.phone || undefined },
      'Fine Issued',
      `A fine of ₹${amount} has been issued to your account. Reason: ${reason}. You can dispute this fine within 7 days.`
    )

    await logAdminActivity(
      session.user.id,
      'ISSUE_FINE',
      'Fine',
      result.fine.id,
      { userId: id, amount, reason }
    )

    return NextResponse.json(result.fine)
  } catch (error) {
    console.error('Issue fine error:', error)
    return NextResponse.json(
      { error: 'Failed to issue fine' },
      { status: 500 }
    )
  }
}

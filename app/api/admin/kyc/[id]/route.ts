import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { logAdminActivity, sendNotification } from '@/lib/admin-utils'

// PUT /api/admin/kyc/[id] - Approve/reject KYC
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

    const { action, remarks } = await req.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.kycDocuments) {
      return NextResponse.json(
        { error: 'No KYC documents submitted' },
        { status: 400 }
      )
    }

    // Update KYC status
    const updated = await prisma.user.update({
      where: { id },
      data: {
        kycVerified: action === 'approve',
        kycDocuments: action === 'reject' ? Prisma.DbNull : user.kycDocuments,
      },
    })

    // Send notification
    await sendNotification(
      { email: user.email, phone: user.phone || undefined },
      action === 'approve'
        ? 'KYC Verification Approved'
        : 'KYC Verification Rejected',
      action === 'approve'
        ? 'Your KYC documents have been verified. You can now make withdrawals.'
        : `Your KYC documents were rejected. ${remarks || 'Please re-submit valid documents.'}`
    )

    await logAdminActivity(
      session.user.id,
      action === 'approve' ? 'APPROVE_KYC' : 'REJECT_KYC',
      'KYC',
      id,
      {
        username: user.username,
        remarks,
      }
    )

    return NextResponse.json({
      message: `KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: {
        id: updated.id,
        username: updated.username,
        kycVerified: updated.kycVerified,
      },
    })
  } catch (error) {
    console.error('Process KYC error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

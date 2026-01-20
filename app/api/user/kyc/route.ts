import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/user/kyc - Submit KYC documents
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documents } = await req.json()

    // Validate documents
    if (!documents || !documents.aadhaar || !documents.pan) {
      return NextResponse.json(
        { error: 'Aadhaar and PAN documents are required' },
        { status: 400 }
      )
    }

    // Update user with KYC documents
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        kycDocuments: documents,
      },
    })

    return NextResponse.json({
      message: 'KYC documents submitted successfully. Verification pending.',
      kyc: {
        status: user.kycVerified ? 'verified' : 'pending',
        documents: user.kycDocuments,
      },
    })
  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/user/kyc - Get KYC status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        kycVerified: true,
        kycDocuments: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: user.kycVerified ? 'verified' : user.kycDocuments ? 'pending' : 'not_submitted',
      verified: user.kycVerified,
      documents: user.kycDocuments,
    })
  } catch (error) {
    console.error('Get KYC status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

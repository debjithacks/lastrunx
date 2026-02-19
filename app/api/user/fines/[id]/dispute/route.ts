import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// POST /api/user/fines/[id]/dispute - Submit a dispute for a fine
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { justification, evidence } = await req.json()

    if (!justification || justification.trim().length < 10) {
      return NextResponse.json(
        { error: 'Justification must be at least 10 characters long' },
        { status: 400 }
      )
    }

    // Get fine details
    const fine = await prisma.fine.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        dispute: true
      }
    })

    if (!fine) {
      return NextResponse.json(
        { error: 'Fine not found' },
        { status: 404 }
      )
    }

    // Verify fine belongs to user
    if (fine.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only dispute your own fines' },
        { status: 403 }
      )
    }

    // Check if fine is active
    if (fine.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Cannot dispute a ${fine.status.toLowerCase()} fine` },
        { status: 400 }
      )
    }

    // Check if dispute already exists
    if (fine.dispute) {
      return NextResponse.json(
        { error: 'This fine has already been disputed' },
        { status: 400 }
      )
    }

    // Create dispute in transaction
    const dispute = await prisma.$transaction(async (tx) => {
      // Update fine status
      await tx.fine.update({
        where: { id },
        data: {
          status: 'DISPUTED'
        }
      })

      // Create dispute
      return tx.dispute.create({
        data: {
          fineId: id,
          userId: session.user.id,
          justification: justification.trim(),
          evidence: evidence || null
        }
      })
    })

    // Send notification email to admins (optional, if you want)
    try {
      // You can implement admin notification here
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillarena.com'
      await sendEmail(
        adminEmail,
        `New Dispute Submitted - Fine #${id}`,
        `
          <h2>New Fine Dispute</h2>
          <p><strong>User:</strong> ${fine.user.username} (${fine.user.email})</p>
          <p><strong>Fine Amount:</strong> ₹${fine.amount}</p>
          <p><strong>Fine Reason:</strong> ${fine.reason}</p>
          <p><strong>Dispute Justification:</strong> ${justification}</p>
          ${evidence ? `<p><strong>Evidence:</strong> <a href="${evidence}">View Evidence</a></p>` : ''}
          <p><a href="${process.env.NEXTAUTH_URL}/admin/disputes">Review Dispute</a></p>
        `
      )
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Dispute submitted successfully. An admin will review it shortly.',
      dispute
    }, { status: 201 })
  } catch (error) {
    console.error('Submit dispute error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/user/fines/[id]/dispute - Get dispute details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get fine with dispute
    const fine = await prisma.fine.findUnique({
      where: { id },
      include: {
        dispute: true
      }
    })

    if (!fine) {
      return NextResponse.json(
        { error: 'Fine not found' },
        { status: 404 }
      )
    }

    // Verify fine belongs to user
    if (fine.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!fine.dispute) {
      return NextResponse.json(
        { error: 'No dispute found for this fine' },
        { status: 404 }
      )
    }

    return NextResponse.json(fine.dispute)
  } catch (error) {
    console.error('Get dispute error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

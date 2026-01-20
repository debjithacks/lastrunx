import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Store reset tokens (use Redis in production)
const resetTokens = new Map<string, { email: string; expires: number }>()

// POST /api/auth/forgot-password - Send reset link
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If the email exists, a reset link has been sent',
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    resetTokens.set(token, {
      email,
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    })

    // TODO: Send email with reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    console.log(`📧 Password reset link for ${email}: ${resetLink}`)

    return NextResponse.json({
      message: 'If the email exists, a reset link has been sent',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

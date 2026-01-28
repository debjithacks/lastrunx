import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit, getClientIdentifier, createRateLimitResponse } from '@/lib/rate-limit'
import { sendPasswordResetEmail } from '@/lib/email'

// Store reset tokens (use Redis in production)
const resetTokens = new Map<string, { email: string; expires: number }>()

// POST /api/auth/forgot-password - Send reset link
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(req)
    const rateLimitResult = authRateLimit(identifier)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

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
    
    // Store token in database (expires in 1 hour)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 3600000), // 1 hour
      },
    })

    // Send reset email
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    
    // Send email (don't wait to avoid blocking and prevent email enumeration)
    sendPasswordResetEmail(email, resetLink).catch(err =>
      console.error('Failed to send password reset email:', err)
    )

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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authRateLimit, getClientIdentifier, createRateLimitResponse } from '@/lib/rate-limit'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(req)
    const rateLimitResult = authRateLimit(identifier)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    const { email, username, password, phone } = await req.json()

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })

    // Send welcome email (don't wait for it to avoid blocking)
    sendWelcomeEmail(email, username).catch(err => 
      console.error('Failed to send welcome email:', err)
    )

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

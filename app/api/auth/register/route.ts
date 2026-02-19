import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authRateLimit, getClientIdentifier, createRateLimitResponse } from '@/lib/rate-limit'
import { sendWelcomeEmail } from '@/lib/email'
import { registerSchema, validateRequest, formatValidationErrors } from '@/lib/validation'
import { logger, extractRequestContext } from '@/lib/logger'
import { validateReferralCode, trackReferral } from '@/lib/referral-system'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestContext = extractRequestContext(req)
  
  try {
    // Rate limiting
    const identifier = getClientIdentifier(req)
    const rateLimitResult = authRateLimit(identifier)
    if (!rateLimitResult.success) {
      logger.securityEvent('Rate limit exceeded on registration', 'MEDIUM', {
        ...requestContext,
        identifier
      })
      return createRateLimitResponse(rateLimitResult)
    }

    const body = await req.json()

    // Validate input
    const validation = await validateRequest(registerSchema, body)
    if (!validation.success) {
      logger.warn('Registration failed - Validation error', {
        ...requestContext,
        errors: formatValidationErrors(validation.errors)
      })
      return NextResponse.json(
        { error: formatValidationErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { email, username, password, phone, referralCode } = validation.data

    // Validate referral code if provided
    let referrerId: string | null = null
    if (referralCode) {
      const referralValidation = await validateReferralCode(referralCode)
      if (!referralValidation.valid) {
        logger.warn('Registration failed - Invalid referral code', {
          ...requestContext,
          referralCode
        })
        return NextResponse.json(
          { error: 'Invalid or expired referral code' },
          { status: 400 }
        )
      }
      referrerId = referralValidation.referrerId || null
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
      logger.warn('Registration failed - User already exists', {
        ...requestContext,
        email,
        username
      })
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

    // Track referral if code was used
    if (referralCode && referrerId) {
      await trackReferral(user.id, referralCode).catch(err => {
        logger.error('Failed to track referral', err, { userId: user.id, referrerId })
      })
    }

    const duration = Date.now() - startTime
    logger.authEvent('User registered successfully', true, {
      ...requestContext,
      userId: user.id,
      username: user.username,
      duration
    })

    // Send welcome email (don't wait for it to avoid blocking)
    sendWelcomeEmail(email, username).catch(err => {
      logger.error('Failed to send welcome email', err, { userId: user.id })
    })

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Registration error - Internal server error', error as Error, {
      ...requestContext,
      duration
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

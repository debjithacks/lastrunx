import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/otp'

// POST /api/auth/phone/login - Login with phone and OTP
export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      )
    }

    // Validate phone format with country code
    if (!/^\+\d{1,4}\d{8,11}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Verify OTP
    const isValid = verifyOTP(phone, otp)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Get user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        phoneVerified: true,
        isActive: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      )
    }

    // Mark phone as verified if not already
    if (!user.phoneVerified) {
      await prisma.user.update({
        where: { phone },
        data: { phoneVerified: true },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Phone login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

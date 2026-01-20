import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, storeOTP, sendSMS } from '@/lib/otp'

// POST /api/auth/send-otp - Send OTP to phone
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be 10 digits.' },
        { status: 400 }
      )
    }

    // Check if phone exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Phone number not registered' },
        { status: 404 }
      )
    }

    // Generate and store OTP
    const otp = generateOTP()
    storeOTP(phone, otp)

    // Send SMS
    await sendSMS(
      phone,
      `Your LastRunx OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`
    )

    return NextResponse.json({
      message: 'OTP sent successfully',
      phone: phone.replace(/(\d{6})/, '******'),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, storeOTP, sendSMS } from '@/lib/otp'

// Valid country codes
const validCountryCodes = ['+91', '+1', '+44', '+971', '+61', '+86', '+81', '+82', '+65']

// POST /api/auth/send-otp - Send OTP to phone
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    // Validate phone format with country code (e.g., +91xxxxxxxxxx)
    if (!phone || !/^\+\d{1,4}\d{8,11}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Must include country code (e.g., +911234567890)' },
        { status: 400 }
      )
    }

    // Extract and validate country code
    const countryCode = validCountryCodes.find(code => phone.startsWith(code))
    if (!countryCode) {
      return NextResponse.json(
        { error: 'Unsupported country code' },
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
      phone: phone.slice(0, -6) + '******', // Mask last 6 digits
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

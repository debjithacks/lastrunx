import { sendOTP as sendOTPViaSMS } from './sms'

// Simple in-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expires: number }>()

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function storeOTP(phone: string, otp: string): void {
  otpStore.set(phone, {
    otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  })
}

export function verifyOTP(phone: string, otp: string): boolean {
  const stored = otpStore.get(phone)
  
  if (!stored) return false
  if (Date.now() > stored.expires) {
    otpStore.delete(phone)
    return false
  }
  
  if (stored.otp === otp) {
    otpStore.delete(phone)
    return true
  }
  
  return false
}

export async function sendOTP(phone: string, otp: string) {
  await sendOTPViaSMS(phone, otp)
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // TODO: Integrate with MSG91 or Twilio
  // For now, just log to console
  console.log(`📱 SMS to ${phone}: ${message}`)
  return true
}

# 🔧 Critical Fixes Required Before Production

## Issue #1: Password Reset Route Disabled ❌

**Problem**: The password reset route has TypeScript compilation errors and is currently disabled.

**Quick Fix**: Use database-based token storage instead of in-memory

**Create**: `app/api/auth/reset-password/route.ts`

```typescript
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Find token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } })
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({ where: { token } })

    return NextResponse.json({
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Update**: `app/api/auth/forgot-password/route.ts`

Replace the in-memory storage with database storage:

```typescript
// Instead of:
// (global as any).resetTokens?.set(resetToken, { email, expires: Date.now() + 3600000 })

// Use:
await prisma.verificationToken.create({
  data: {
    identifier: email,
    token: resetToken,
    expires: new Date(Date.now() + 3600000), // 1 hour
  },
})
```

---

## Issue #2: Email Sending Not Implemented 📧

**Problem**: All email notifications are only logged to console, not actually sent.

**Quick Fix**: Use Nodemailer with Gmail or SendGrid

**Install**:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

**Create**: `lib/email.ts`

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'SkillArena <noreply@skillarena.com>',
      to,
      subject,
      html,
    })
    console.log(`✅ Email sent to ${to}`)
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the link below to proceed:</p>
    <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:white;text-decoration:none;border-radius:5px;">
      Reset Password
    </a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `
  await sendEmail(email, 'Password Reset Request', html)
}

export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <h2>Welcome to SkillArena!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for joining SkillArena. Start playing tournaments and win real money!</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/tournaments">Browse Tournaments</a>
  `
  await sendEmail(email, 'Welcome to SkillArena!', html)
}
```

**Update**: `lib/admin-utils.ts`

```typescript
import { sendEmail } from './email'

export async function sendNotification(
  recipient: { email?: string; phone?: string },
  title: string,
  message: string
) {
  if (recipient.email) {
    await sendEmail(recipient.email, title, message)
  }
  
  if (recipient.phone) {
    await sendSMS(recipient.phone, message)
  }
}
```

**Update**: `app/api/auth/forgot-password/route.ts`

```typescript
import { sendPasswordResetEmail } from '@/lib/email'

// Replace console.log with:
await sendPasswordResetEmail(email, resetLink)
```

**Update**: `app/api/auth/register/route.ts`

```typescript
import { sendWelcomeEmail } from '@/lib/email'

// After user creation:
await sendWelcomeEmail(email, fullName)
```

---

## Issue #3: SMS Sending Not Implemented 📱

**Problem**: OTP SMS messages are only logged to console.

**Quick Fix**: Integrate MSG91 or Twilio

### Option A: MSG91 (India-focused)

**Install**:
```bash
npm install axios
```

**Create**: `lib/sms.ts`

```typescript
import axios from 'axios'

export async function sendSMS(phone: string, message: string) {
  if (!process.env.SMS_API_KEY) {
    console.log(`📱 SMS to ${phone}: ${message}`)
    return // Fallback to console in dev
  }

  try {
    await axios.post('https://api.msg91.com/api/v5/flow/', {
      sender: process.env.SMS_SENDER_ID,
      route: '4',
      country: '91',
      sms: [
        {
          message: message,
          to: [phone.replace('+91', '')]
        }
      ]
    }, {
      headers: {
        'authkey': process.env.SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    })
    console.log(`✅ SMS sent to ${phone}`)
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    throw error
  }
}

export async function sendOTP(phone: string, otp: string) {
  const message = `Your SkillArena OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`
  await sendSMS(phone, message)
}
```

### Option B: Twilio (Global)

```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(phone: string, message: string) {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    console.log(`✅ SMS sent to ${phone}`)
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    throw error
  }
}
```

**Update**: `lib/otp.ts`

```typescript
import { sendOTP } from './sms'

export async function sendOTPViaSMS(phone: string, otp: string) {
  await sendOTP(phone, otp)
}
```

---

## Issue #4: File Upload for KYC Not Implemented 📁

**Problem**: KYC documents stored as JSON, should be uploaded to S3.

**Quick Fix**: Use AWS S3 or Cloudinary

**Install**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
npm install -D @types/multer
```

**Create**: `lib/upload.ts`

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(file: Buffer, fileName: string, mimeType: string) {
  const key = `kyc/${Date.now()}-${fileName}`
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: mimeType,
  }))

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function getUploadUrl(fileName: string, fileType: string) {
  const key = `kyc/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  
  return {
    uploadUrl,
    fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  }
}
```

**Create**: `app/api/user/kyc/upload-url/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUploadUrl } from '@/lib/upload'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fileName, fileType } = await req.json()

  const { uploadUrl, fileUrl } = await getUploadUrl(fileName, fileType)

  return NextResponse.json({ uploadUrl, fileUrl })
}
```

---

## Issue #5: Rate Limiting Not Implemented 🛡️

**Problem**: APIs vulnerable to brute force and DDoS attacks.

**Quick Fix**: Add rate limiting middleware

**Install**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Create**: `lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create rate limiter instances
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
})

export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
})

export async function checkRateLimit(identifier: string, limit: Ratelimit) {
  const { success, remaining } = await limit.limit(identifier)
  return { success, remaining }
}
```

**Usage in API routes**:

```typescript
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for') || 'anonymous'
  const { success } = await checkRateLimit(ip, authRateLimit)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }
  
  // Rest of your code...
}
```

---

## Quick Environment Variables Setup

Add these to your `.env` file:

```env
# Email (Choose one)
# Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="SkillArena <noreply@skillarena.com>"

# SendGrid (Alternative)
SENDGRID_API_KEY="your_sendgrid_api_key"

# SMS (Choose one)
# MSG91
SMS_API_KEY="your_msg91_api_key"
SMS_SENDER_ID="SKLARN"

# Twilio (Alternative)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# AWS S3
AWS_S3_BUCKET="skillarena-uploads"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="ap-south-1"

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

---

## Testing Commands

After implementing fixes:

```bash
# 1. Test build
npm run build

# 2. Test email (create test route)
curl -X POST http://localhost:3000/api/test/email

# 3. Test SMS (create test route)
curl -X POST http://localhost:3000/api/test/sms

# 4. Test file upload
# Upload via Postman or frontend

# 5. Test rate limiting
# Make multiple requests rapidly

# 6. Test password reset flow
# Request reset → Check email → Click link → Reset password
```

---

## Priority Order

1. **Password Reset** (Blocks user recovery) - 2 hours
2. **Email Sending** (Essential for communications) - 3 hours
3. **SMS Sending** (Required for OTP) - 2 hours
4. **File Upload** (KYC verification needs this) - 4 hours
5. **Rate Limiting** (Security essential) - 2 hours

**Total Estimated Time**: 13 hours of development work

---

**After completing these fixes, your application will be production-ready!**

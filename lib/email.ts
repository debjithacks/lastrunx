import nodemailer from 'nodemailer'

// Create reusable transporter
const getTransporter = () => {
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️ SMTP not configured, emails will be logged only')
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter()
  
  if (!transporter) {
    console.log(`📧 Email to ${to}:`, { subject, html })
    return
  }

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
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for your SkillArena account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <div class="footer">
          <p>This is an automated email from SkillArena. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
  await sendEmail(email, 'Password Reset Request - SkillArena', html)
}

export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .highlight { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎮 Welcome to SkillArena!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for joining SkillArena, the premier skill-based gaming tournament platform!</p>
        <div class="highlight">
          <p><strong>Get Started:</strong></p>
          <ul>
            <li>Browse exciting tournaments</li>
            <li>Add money to your wallet</li>
            <li>Join tournaments and win real cash!</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/tournaments" class="button">Browse Tournaments</a>
        <p>Happy Gaming!</p>
        <p>Team SkillArena</p>
      </div>
    </body>
    </html>
  `
  await sendEmail(email, 'Welcome to SkillArena! 🎮', html)
}

export async function sendKYCVerificationEmail(email: string, name: string, status: 'approved' | 'rejected', remarks?: string) {
  const isApproved = status === 'approved'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .status { padding: 15px; border-radius: 5px; margin: 20px 0; }
        .approved { background: #d1fae5; color: #065f46; }
        .rejected { background: #fee2e2; color: #991b1b; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>KYC Verification ${isApproved ? 'Approved' : 'Rejected'}</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <div class="status ${isApproved ? 'approved' : 'rejected'}">
          <p><strong>${isApproved ? '✅ Your KYC has been verified!' : '❌ Your KYC was rejected'}</strong></p>
          <p>${isApproved 
            ? 'You can now make withdrawals from your wallet.' 
            : remarks || 'Please re-submit valid documents.'
          }</p>
        </div>
        ${isApproved 
          ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" class="button">View Profile</a>`
          : `<a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" class="button">Re-submit KYC</a>`
        }
        <p>Team SkillArena</p>
      </div>
    </body>
    </html>
  `
  await sendEmail(email, `KYC Verification ${isApproved ? 'Approved' : 'Rejected'} - SkillArena`, html)
}

export async function sendWithdrawalStatusEmail(email: string, name: string, amount: number, status: 'approved' | 'rejected', remarks?: string) {
  const isApproved = status === 'approved'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .status { padding: 15px; border-radius: 5px; margin: 20px 0; }
        .approved { background: #d1fae5; color: #065f46; }
        .rejected { background: #fee2e2; color: #991b1b; }
        .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Withdrawal ${isApproved ? 'Approved' : 'Rejected'}</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <div class="status ${isApproved ? 'approved' : 'rejected'}">
          <p><strong>${isApproved ? '✅ Withdrawal Approved' : '❌ Withdrawal Rejected'}</strong></p>
          <p class="amount">₹${amount}</p>
          <p>${isApproved 
            ? 'The amount will be credited to your bank account within 3-5 business days.' 
            : remarks || 'Please contact support for more information.'
          }</p>
        </div>
        <p>Team SkillArena</p>
      </div>
    </body>
    </html>
  `
  await sendEmail(email, `Withdrawal ${isApproved ? 'Approved' : 'Rejected'} - SkillArena`, html)
}

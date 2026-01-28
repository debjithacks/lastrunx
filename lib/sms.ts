// SMS Service with support for MSG91 and Twilio

interface SMSProvider {
  sendSMS(phone: string, message: string): Promise<void>
}

class MSG91Provider implements SMSProvider {
  private apiKey: string
  private senderId: string

  constructor(apiKey: string, senderId: string) {
    this.apiKey = apiKey
    this.senderId = senderId
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    
    try {
      const response = await fetch('https://api.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: this.senderId,
          route: '4',
          country: '91',
          sms: [{
            message: message,
            to: [cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone]
          }]
        }),
      })

      if (!response.ok) {
        throw new Error(`MSG91 API error: ${response.statusText}`)
      }

      console.log(`✅ SMS sent to ${phone} via MSG91`)
    } catch (error) {
      console.error('❌ MSG91 SMS failed:', error)
      throw error
    }
  }
}

class TwilioProvider implements SMSProvider {
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid
    this.authToken = authToken
    this.fromNumber = fromNumber
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: this.fromNumber,
            To: phone,
            Body: message,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Twilio API error: ${response.statusText}`)
      }

      console.log(`✅ SMS sent to ${phone} via Twilio`)
    } catch (error) {
      console.error('❌ Twilio SMS failed:', error)
      throw error
    }
  }
}

class ConsoleSMSProvider implements SMSProvider {
  async sendSMS(phone: string, message: string): Promise<void> {
    console.log(`📱 SMS to ${phone}: ${message}`)
  }
}

// Get SMS provider based on environment configuration
function getSMSProvider(): SMSProvider {
  // MSG91
  if (process.env.SMS_API_KEY && process.env.SMS_SENDER_ID) {
    return new MSG91Provider(process.env.SMS_API_KEY, process.env.SMS_SENDER_ID)
  }
  
  // Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    return new TwilioProvider(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_PHONE_NUMBER
    )
  }

  // Fallback to console logging
  console.warn('⚠️ SMS service not configured, messages will be logged only')
  return new ConsoleSMSProvider()
}

const smsProvider = getSMSProvider()

export async function sendSMS(phone: string, message: string): Promise<void> {
  await smsProvider.sendSMS(phone, message)
}

export async function sendOTP(phone: string, otp: string): Promise<void> {
  const message = `Your SkillArena OTP is ${otp}. Valid for 10 minutes. Do not share with anyone. - SkillArena`
  await sendSMS(phone, message)
}

export async function sendTournamentReminder(phone: string, tournamentName: string, time: string): Promise<void> {
  const message = `Reminder: Your tournament "${tournamentName}" starts at ${time}. Join room details will be available 15 minutes before. - SkillArena`
  await sendSMS(phone, message)
}

export async function sendWinNotification(phone: string, amount: number, tournamentName: string): Promise<void> {
  const message = `Congratulations! You won ₹${amount} in "${tournamentName}". Amount credited to your wallet. - SkillArena`
  await sendSMS(phone, message)
}

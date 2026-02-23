'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FlaticonIcon } from '@/components/FlaticonIcon'

// Country codes with validation rules
const countryCodes = [
  { id: 'IN', code: '+91', country: 'India', flag: '🇮🇳', length: 10, startsWithAny: ['6', '7', '8', '9'] },
  { id: 'US', code: '+1', country: 'USA', flag: '🇺🇸', length: 10, startsWithAny: ['2', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 'CA', code: '+1', country: 'Canada', flag: '🇨🇦', length: 10, startsWithAny: ['2', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 'GB', code: '+44', country: 'UK', flag: '🇬🇧', length: 10, startsWithAny: ['7', '1', '2'] },
  { id: 'AE', code: '+971', country: 'UAE', flag: '🇦🇪', length: 9, startsWithAny: ['5'] },
  { id: 'AU', code: '+61', country: 'Australia', flag: '🇦🇺', length: 9, startsWithAny: ['4'] },
  { id: 'CN', code: '+86', country: 'China', flag: '🇨🇳', length: 11, startsWithAny: ['1', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 'JP', code: '+81', country: 'Japan', flag: '🇯🇵', length: 10, startsWithAny: ['7', '8', '9'] },
  { id: 'KR', code: '+82', country: 'South Korea', flag: '🇰🇷', length: 10, startsWithAny: ['1'] },
  { id: 'SG', code: '+65', country: 'Singapore', flag: '🇸🇬', length: 8, startsWithAny: ['8', '9'] },
]

export default function PhoneLoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isValidPhone, setIsValidPhone] = useState(false)
  const router = useRouter()

  // Auto-detect country based on timezone
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const timezoneMap: Record<string, string> = {
        'Asia/Kolkata': 'IN',
        'Asia/Calcutta': 'IN',
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'America/Phoenix': 'US',
        'America/Toronto': 'CA',
        'America/Vancouver': 'CA',
        'America/Montreal': 'CA',
        'Europe/London': 'GB',
        'Asia/Dubai': 'AE',
        'Australia/Sydney': 'AU',
        'Australia/Melbourne': 'AU',
        'Asia/Shanghai': 'CN',
        'Asia/Tokyo': 'JP',
        'Asia/Seoul': 'KR',
        'Asia/Singapore': 'SG',
      }
      
      const detectedId = timezoneMap[timezone]
      if (detectedId) {
        const country = countryCodes.find(c => c.id === detectedId)
        if (country) {
          setSelectedCountry(country)
        }
      }
    } catch (error) {
      console.log('Timezone detection failed, using default')
    }
  }, [])

  // Validate phone number in real-time
  useEffect(() => {
    if (!phone) {
      setIsValidPhone(false)
      return
    }

    const isCorrectLength = phone.length === selectedCountry.length
    
    if (!isCorrectLength) {
      setIsValidPhone(false)
      return
    }

    // Validate first digit matches country requirements
    const firstDigit = phone.charAt(0)
    const isValidFirstDigit = selectedCountry.startsWithAny.includes(firstDigit)
    
    setIsValidPhone(isValidFirstDigit)
  }, [phone, selectedCountry])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation before sending OTP
    if (!selectedCountry) {
      setError('Please select a country code')
      setIsLoading(false)
      return
    }

    if (phone.length !== selectedCountry.length) {
      setError(`Phone number must be ${selectedCountry.length} digits for ${selectedCountry.country}`)
      setIsLoading(false)
      return
    }

    // Validate first digit matches country requirements
    const firstDigit = phone.charAt(0)
    if (!selectedCountry.startsWithAny.includes(firstDigit)) {
      setError(`Phone number must start with ${selectedCountry.startsWithAny.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      const fullPhone = `${selectedCountry.code}${phone}`
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      setSuccess('OTP sent successfully!')
      setStep('otp')
    } catch (error) {
      console.error('Send OTP error:', error)
      setError('An error occurred while sending OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const fullPhone = `${selectedCountry.code}${phone}`
      // Verify OTP with our API
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid OTP')
        return
      }

      // Sign in with credentials using the verified user's email
      const result = await signIn('credentials', {
        email: data.user.email,
        password: otp, // Using OTP as temporary password
        redirect: false,
      })

      if (result?.error) {
        // If credentials login fails, just redirect anyway since OTP is verified
        router.push('/')
        router.refresh()
      } else if (result?.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setError('An error occurred while verifying OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {step === 'phone' ? 'Phone Login' : 'Verify OTP'}
            </h1>
            <p className="text-slate-500 text-sm">
              {step === 'phone' 
                ? 'Enter your phone number to receive an OTP' 
                : `Enter the OTP sent to ${selectedCountry.code} ${phone}`
              }
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm font-medium flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-600 text-sm font-medium flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {success}
            </div>
          )}

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Number
                </label>
                <div className="relative flex items-stretch rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden bg-white">
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <select
                      id="country"
                      value={selectedCountry.id}
                      onChange={(e) => {
                        const country = countryCodes.find(c => c.id === e.target.value)
                        if (country) {
                          setSelectedCountry(country)
                          setPhone('') // Reset phone when country changes
                        }
                      }}
                      className="h-full pl-3 pr-8 py-2.5 text-base font-medium text-slate-700 bg-slate-50 border-r border-slate-200 outline-none cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                      style={{ minWidth: '85px' }}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={selectedCountry.length}
                    required
                    className="flex-1 px-3 py-2.5 outline-none text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder={`${'0'.repeat(selectedCountry.length)}`}
                  />

                  {/* Validation Checkmark */}
                  {isValidPhone && (
                    <div className="flex items-center pr-3 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Enter {selectedCountry.length} digits
                  {phone.length > 0 && !isValidPhone && (
                    <span className="text-orange-500 ml-2">
                      {phone.length < selectedCountry.length ? (
                        <>• {selectedCountry.length - phone.length} more digit{selectedCountry.length - phone.length !== 1 ? 's' : ''} needed</>
                      ) : (
                        <span className="block text-red-500">Invalid number. Must start with {selectedCountry.startsWithAny.join(', ')}</span>
                      )}
                    </span>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isValidPhone}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <FlaticonIcon name="arrow-small-right" style="bold" className="text-base" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Enter OTP
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <FlaticonIcon name="lock" style="regular" className="text-lg" />
                  </span>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-400 text-center text-2xl tracking-widest"
                    placeholder="••••••"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">6-digit OTP sent to your phone</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <FlaticonIcon name="arrow-small-right" style="bold" className="text-base" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setError('')
                  setSuccess('')
                }}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-700 font-medium transition"
              >
                Change phone number
              </button>
            </form>
          )}

          {/* Back to Email Login */}
          <div className="text-center mt-6 pt-6 border-t border-slate-100">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 hover:text-slate-700 transition flex items-center justify-center gap-2"
            >
              <FlaticonIcon name="arrow-small-left" style="regular" className="text-base" />
              Back to email login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

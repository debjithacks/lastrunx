'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    twoFactorCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      if (!showTwoFactor) {
        setShowTwoFactor(true)
        setIsLoading(false)
      } else {
        console.log('Admin login attempt:', formData)
        setIsLoading(false)
      }
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      {/* Floating Admin Icons */}
      <div className="absolute top-20 left-10 text-4xl opacity-10 animate-float">👑</div>
      <div className="absolute bottom-32 right-16 text-3xl opacity-10 animate-float animation-delay-2000">🛡️</div>
      <div className="absolute top-1/3 right-1/4 text-3xl opacity-10 animate-float animation-delay-4000">⚙️</div>
      <div className="absolute bottom-20 left-1/4 text-2xl opacity-10 animate-float animation-delay-3000">🔐</div>

      {/* Admin Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-purple-500/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-4xl transform hover:rotate-12 transition-transform duration-300 shadow-lg shadow-purple-500/50">
                👑
              </div>
            </div>
            <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-slate-400">Secure administrator access</p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-400 text-xs font-bold">RESTRICTED ACCESS</span>
            </div>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!showTwoFactor ? (
              <>
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-slate-300 mb-2">
                    Admin Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                      👤
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border-2 border-purple-500/30 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none font-medium placeholder-slate-500"
                      placeholder="admin@skillarena"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                      🔒
                    </span>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border-2 border-purple-500/30 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none font-medium placeholder-slate-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Two-Factor Authentication */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-purple-600/20 border-2 border-purple-500/50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                    🔐
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-400">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-semibold text-slate-300 mb-2">
                    Authentication Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="twoFactorCode"
                      name="twoFactorCode"
                      value={formData.twoFactorCode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      className="w-full px-4 py-4 rounded-xl bg-slate-900/50 border-2 border-purple-500/30 text-white text-center text-2xl font-bold tracking-widest focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none placeholder-slate-500"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTwoFactor(false)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  ← Back to login
                </button>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {showTwoFactor ? 'Verifying...' : 'Authenticating...'}
                </span>
              ) : showTwoFactor ? (
                'Verify & Login'
              ) : (
                'Continue to 2FA'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-sm font-bold text-yellow-400 mb-1">Security Notice</h4>
                <p className="text-xs text-yellow-300/80">
                  All admin login attempts are monitored and logged. Unauthorized access attempts will be reported.
                </p>
              </div>
            </div>
          </div>

          {/* Back to User Login */}
          <div className="text-center mt-6 pt-6 border-t border-slate-700">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-400 hover:text-white transition flex items-center justify-center gap-1"
            >
              <span>←</span>
              Back to User Login
            </Link>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Protected by advanced security protocols
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-slate-600">
            <span className="flex items-center gap-1 text-xs">
              🔐 SSL Encrypted
            </span>
            <span className="flex items-center gap-1 text-xs">
              🛡️ 2FA Required
            </span>
            <span className="flex items-center gap-1 text-xs">
              📊 Activity Logged
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

'use client'

import { BookOpen, UserPlus, Gamepad2, Trophy, Banknote, CreditCard, Smartphone, Globe, ShieldCheck, ArrowRight, Zap, Crosshair, Swords } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen py-12 md:py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-6 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            How It Works
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Get started with skill-based gaming tournaments in 4 easy steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <UserPlus className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Create Your Account</h3>
                <p className="text-slate-600 mb-6 leading-relaxed max-w-3xl">
                  Sign up with your email, phone number, or social media accounts. Complete KYC verification to ensure legal compliance and secure your account.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">18+ Age Verification</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">Valid ID Required</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">Phone Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Gamepad2 className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Choose Your Game</h3>
                <p className="text-slate-600 mb-6 leading-relaxed max-w-3xl">
                  Browse our collection of 100% skill-based games. Filter by game type, entry fee, prize pool, or skill level.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-indigo-600">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">BGMI</div>
                    <div className="text-xs text-slate-500">Battle Royale</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-indigo-600">
                      <Crosshair className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">COD Mobile</div>
                    <div className="text-xs text-slate-500">FPS Action</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-indigo-600">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">Free Fire</div>
                    <div className="text-xs text-slate-500">Battle Royale</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-indigo-600">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">Clash Royale</div>
                    <div className="text-xs text-slate-500">Strategy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Trophy className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Join a Tournament</h3>
                <p className="text-slate-600 mb-6 leading-relaxed max-w-3xl">
                  Select a tournament based on entry fee and prize pool. Pay the entry fee securely using UPI, Cards, or Net Banking.
                </p>
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Tournament Formats:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className="font-medium text-slate-900">Solo:</span> Individual competition
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className="font-medium text-slate-900">Squad:</span> Team-based battles
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className="font-medium text-slate-900">Leagues:</span> Multi-round events
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className="font-medium text-slate-900">Daily Contests:</span> Instant matches
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Banknote className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Compete & Win</h3>
                <p className="text-slate-600 mb-6 leading-relaxed max-w-3xl">
                  Play the game, showcase your skills, and compete for prizes. Winnings are instantly credited to your wallet and can be withdrawn to your bank account.
                </p>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Prize & Withdrawals:</p>
                  <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      Instant wallet credit
                    </li>
                    <li className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Bank withdrawals (1-3 days)
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Secure payment gateways
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      TDS compliant (Indian Laws)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Supported Payment Methods</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-col items-center gap-2 p-4 w-32 bg-slate-50 rounded-xl border border-slate-100">
              <Smartphone className="w-8 h-8 text-indigo-600" />
              <span className="font-semibold text-slate-900 text-sm">UPI</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 w-32 bg-slate-50 rounded-xl border border-slate-100">
              <CreditCard className="w-8 h-8 text-indigo-600" />
              <span className="font-semibold text-slate-900 text-sm">Cards</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 w-32 bg-slate-50 rounded-xl border border-slate-100">
              <Globe className="w-8 h-8 text-indigo-600" />
              <span className="font-semibold text-slate-900 text-sm">Net Banking</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

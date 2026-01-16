'use client'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4 px-6 py-2 bg-slate-100 border border-slate-300 rounded-full">
            <span className="text-slate-700 font-semibold text-xs sm:text-sm">📚 User Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-gradient">
            How It Works
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 font-medium">
            Get started with skill-based gaming tournaments in 4 easy steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {/* Step 1 */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-800 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">Create Your Account</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Sign up with your email, phone number, or social media accounts. Complete KYC verification to ensure legal compliance and secure your account.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><span className="text-blue-600 mr-2">•</span> Must be 18+ years old</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">•</span> Valid government ID required</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-2">•</span> Email and phone verification</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-800 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">Choose Your Game</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Browse our collection of 100% skill-based games. Filter by game type, entry fee, prize pool, or skill level.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="font-semibold text-slate-800 text-sm">BGMI</div>
                    <div className="text-xs text-slate-600">Battle Royale</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-2xl mb-1">🎮</div>
                    <div className="font-semibold text-slate-800 text-sm">COD Mobile</div>
                    <div className="text-xs text-slate-600">FPS Action</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="font-semibold text-slate-800 text-sm">Free Fire Max</div>
                    <div className="text-xs text-slate-600">Battle Royale</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-2xl mb-1">👑</div>
                    <div className="font-semibold text-slate-800 text-sm">Clash Royale</div>
                    <div className="text-xs text-slate-600">Card Strategy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-800 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">Join a Tournament</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Select a tournament based on entry fee and prize pool. Pay the entry fee securely and get ready to compete.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-slate-700 mb-2"><strong>Tournament Types:</strong></p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• <strong>Solo:</strong> Compete individually</li>
                    <li>• <strong>Squad:</strong> Team-based tournaments</li>
                    <li>• <strong>Leagues:</strong> Multi-round competitions</li>
                    <li>• <strong>Daily Contests:</strong> Quick matches with instant results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-800 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">Compete & Win</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Play the game, showcase your skills, and compete for prizes. Winners are determined based on performance metrics and leaderboard rankings.
                </p>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-slate-700 mb-2"><strong>Prize Distribution:</strong></p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• Top performers win cash prizes</li>
                    <li>• Instant credit to your wallet</li>
                    <li>• Withdraw to bank account (1-3 business days)</li>
                    <li>• TDS deductions as per Indian tax laws</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-6">
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">💰 Payment Methods</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-3xl mb-2">💳</div>
                <div className="font-semibold text-slate-800 text-sm">Credit/Debit Cards</div>
                <div className="text-xs text-slate-600">Visa, Mastercard</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-3xl mb-2">🏦</div>
                <div className="font-semibold text-slate-800 text-sm">UPI</div>
                <div className="text-xs text-slate-600">GPay, PhonePe, Paytm</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-3xl mb-2">🏧</div>
                <div className="font-semibold text-slate-800 text-sm">Net Banking</div>
                <div className="text-xs text-slate-600">All major banks</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

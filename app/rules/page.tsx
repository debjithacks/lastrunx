'use client'

export default function RulesPage() {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4 px-6 py-2 bg-slate-100 border border-slate-300 rounded-full">
            <span className="text-slate-700 font-semibold text-xs sm:text-sm">📜 Terms & Conditions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-gradient">
            Rules & Fair Play
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 font-medium">
            Guidelines for responsible and fair gaming on LastRunx
          </p>
        </div>

        <div className="space-y-6">
          {/* Eligibility */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Eligibility Criteria</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Must be <strong>18 years or older</strong> to participate</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Must be a resident of India (excluding restricted states)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Valid KYC documents required (Aadhaar, PAN, Driving License, or Passport)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>One account per person (multiple accounts prohibited)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Employees and family members of LastRunx are not eligible to participate</span>
              </li>
            </ul>
          </section>

          {/* Restricted States */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Restricted States</h2>
            <p className="text-slate-600 mb-4">
              As per state-specific regulations, residents of the following states are <strong>NOT permitted</strong> to participate in real-money skill gaming:
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                <li>• Andhra Pradesh</li>
                <li>• Telangana</li>
                <li>• Assam</li>
                <li>• Odisha</li>
                <li>• Sikkim (certain restrictions)</li>
                <li>• Nagaland (certain restrictions)</li>
              </ul>
            </div>
            <p className="text-xs text-slate-500 mt-3">*This list may change based on evolving state regulations. Users are responsible for verifying their local laws.</p>
          </section>

          {/* Fair Play Policy */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Fair Play & Anti-Cheating Policy</h2>
            <p className="text-slate-600 mb-4"><strong>Zero Tolerance for Cheating:</strong></p>
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">❌ Prohibited Activities:</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Using hacks, mods, or third-party software</li>
                  <li>• Teaming or collusion with other players</li>
                  <li>• Win-trading or match-fixing</li>
                  <li>• Creating multiple accounts</li>
                  <li>• Sharing accounts or boosting services</li>
                  <li>• Exploiting bugs or glitches</li>
                  <li>• DDoS attacks or server manipulation</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-500">
                <h3 className="font-semibold text-slate-800 mb-2">✅ Fair Play Requirements:</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Play from original game clients only</li>
                  <li>• No emulators unless explicitly allowed</li>
                  <li>• Stable internet connection required</li>
                  <li>• Screen recording may be requested for verification</li>
                  <li>• Anti-cheat software must be enabled</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Penalties */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Penalties for Violations</h2>
            <div className="space-y-3 text-slate-600">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-slate-800">First Offense:</h3>
                <p className="text-sm">Warning + 7-day account suspension</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-slate-800">Second Offense:</h3>
                <p className="text-sm">30-day account suspension + forfeiture of ongoing prizes</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-slate-800">Third Offense / Severe Violations:</h3>
                <p className="text-sm">Permanent account ban + legal action + forfeiture of all winnings</p>
              </div>
            </div>
          </section>

          {/* Responsible Gaming */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Responsible Gaming</h2>
            <p className="text-slate-600 mb-4">We promote healthy gaming habits:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Set deposit limits (daily/weekly/monthly)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Self-exclusion options available (7/30/90 days or permanent)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Play time limits and reminders</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Access to gambling addiction helplines</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Reality checks every 60 minutes</span>
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-300 p-4 rounded mt-4">
              <p className="text-sm text-slate-700">
                <strong>Need Help?</strong> Contact National Gambling Helpline: <strong>1800-XXX-XXXX</strong> (toll-free, 24/7)
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Dispute Resolution</h2>
            <div className="space-y-3 text-slate-600">
              <p>If you have concerns about tournament results or transactions:</p>
              <ol className="space-y-2 ml-5 list-decimal">
                <li><strong>Submit Complaint:</strong> Email support@lastrunx.in within 48 hours</li>
                <li><strong>Evidence Required:</strong> Screenshots, video recordings, transaction IDs</li>
                <li><strong>Review Period:</strong> 5-7 business days for investigation</li>
                <li><strong>Decision:</strong> Final decision communicated via email</li>
                <li><strong>Escalation:</strong> Unresolved disputes can be escalated to arbitration</li>
              </ol>
            </div>
          </section>

          {/* TDS & Taxation */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">7. TDS & Taxation (As per Indian Law)</h2>
            <div className="space-y-3 text-slate-600">
              <p className="font-semibold">Tax Deducted at Source (TDS) Rules:</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>30% TDS</strong> applicable on net winnings as per Finance Act 2023</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>TDS deducted automatically before crediting winnings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Form 16A issued for tax filing purposes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>PAN mandatory for withdrawals above ₹10,000</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Privacy & Data Protection</h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Data encrypted with 256-bit SSL</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Compliance with IT Act 2000 and data protection regulations</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Personal information not shared with third parties without consent</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Right to access, modify, or delete your data</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

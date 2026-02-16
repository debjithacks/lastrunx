'use client'

import { FileText, UserCheck, MapPin, ShieldAlert, Award, AlertTriangle, Clock, HelpCircle, ShieldCheck } from 'lucide-react'

export default function RulesPage() {
  return (
    <div className="min-h-screen py-12 md:py-16 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-6 text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Rules & Fair Play
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Guidelines for responsible, fair, and secure gaming on LastRunx
          </p>
        </div>

        <div className="space-y-8">
          {/* Eligibility */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              1. Eligibility Criteria
            </h2>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-indigo-100 rounded-md mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-sm">Age Requirement</strong>
                    <span className="text-slate-600 text-sm">Must be 18 years or older to participate in real-money tournaments.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-indigo-100 rounded-md mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-sm">Location</strong>
                    <span className="text-slate-600 text-sm">Must be a resident of India, excluding restricted states (Andhra Pradesh, Telangana, Assam, Odisha).</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-indigo-100 rounded-md mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-sm">Verification</strong>
                    <span className="text-slate-600 text-sm">Valid KYC documents (Aadhaar, PAN) are required for withdrawals.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-indigo-100 rounded-md mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-sm">One Account Policy</strong>
                    <span className="text-slate-600 text-sm">Strictly one account per person. Multiple accounts will lead to a ban.</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Restricted States */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-600" />
              2. Restricted Locations
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Due to state-specific gaming laws, residents of the following states are <strong>restricted</strong> from participating in cash contests:
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg font-medium">Andhra Pradesh</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg font-medium">Telangana</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg font-medium">Assam</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg font-medium">Odisha</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg font-medium">Sikkim*</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg font-medium">Nagaland*</span>
                </div>
                <p className="text-xs text-slate-400 mt-4 italic">*Certain restrictions apply based on license status.</p>
              </div>
              <div className="flex-shrink-0 bg-slate-100 p-4 rounded-xl border border-slate-200 w-full md:w-64">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Geo-Fencing Enabled
                </h3>
                <p className="text-xs text-slate-600">
                  Our system automatically detects your location during login and gameplay. Access will be denied if you are in a restricted zone.
                </p>
              </div>
            </div>
          </section>

          {/* Fair Play Policy */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-indigo-600" />
              3. Fair Play & Anti-Cheating
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
                <h3 className="font-bold text-rose-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Prohibited (Zero Tolerance)
                </h3>
                <ul className="space-y-2 text-sm text-rose-800">
                  <li className="flex items-center gap-2">• Using hacks, aimbots, or scripts</li>
                  <li className="flex items-center gap-2">• Teaming/Collusion in solo modes</li>
                  <li className="flex items-center gap-2">• Win-trading or match-fixing</li>
                  <li className="flex items-center gap-2">• Account sharing or boosting</li>
                  <li className="flex items-center gap-2">• Exploiting game bugs</li>
                </ul>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Requirements
                </h3>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-center gap-2">• Original game client only</li>
                  <li className="flex items-center gap-2">• Anti-cheat software active</li>
                  <li className="flex items-center gap-2">• Screen recording (if requested)</li>
                  <li className="flex items-center gap-2">• Stable internet connection</li>
                  <li className="flex items-center gap-2">• Fair & respectful conduct</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Penalties */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              4. Violation Penalties
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border-l-4 border-amber-500">
                <div className="font-bold text-slate-900 w-32 shrink-0">Level 1</div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Minor Offense / First Warning</h4>
                  <p className="text-slate-600 text-sm">Warning issued + 7-day account suspension. No prize forfeiture.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border-l-4 border-orange-500">
                <div className="font-bold text-slate-900 w-32 shrink-0">Level 2</div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Repeat Offense / Teaming</h4>
                  <p className="text-slate-600 text-sm">30-day suspension + forfeiture of current tournament winnings.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border-l-4 border-rose-600">
                <div className="font-bold text-slate-900 w-32 shrink-0">Level 3</div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Hacking / Fraud / Severe</h4>
                  <p className="text-slate-600 text-sm">Permanent Ban + Legal Action + Forfeiture of all wallet balance.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Responsible Gaming */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              5. Responsible Gaming
            </h2>
            <p className="text-slate-600 mb-6">We are committed to promoting responsible gaming habits. Tools available to you:</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 text-center">
                <div className="font-semibold text-slate-900 text-sm mb-1">Deposit Limits</div>
                <p className="text-xs text-slate-500">Set daily/monthly caps</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 text-center">
                <div className="font-semibold text-slate-900 text-sm mb-1">Self-Exclusion</div>
                <p className="text-xs text-slate-500">Block access for 7-90 days</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 text-center">
                <div className="font-semibold text-slate-900 text-sm mb-1">Time Alerts</div>
                <p className="text-xs text-slate-500">Reality check reminders</p>
              </div>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
              6. Dispute Resolution
            </h2>
            <div className="prose prose-slate prose-sm text-slate-600">
              <p>
                If you have a dispute regarding tournament results, payments, or account actions, follow these steps:
              </p>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li><strong>Raise a Ticket:</strong> Email support@lastrunx.in within 48 hours of the incident.</li>
                <li><strong>Provide Evidence:</strong> Attach screenshots, screen recordings, or transaction IDs.</li>
                <li><strong>Investigation:</strong> Our team will review the case within 5-7 business days.</li>
                <li><strong>Resolution:</strong> The decision made by the LastRunx Fair Play team is final and binding.</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

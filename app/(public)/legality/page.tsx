'use client'

import { Scale, ShieldCheck, AlertTriangle, Globe, Book, Gavel, FileText } from 'lucide-react'

export default function LegalityPage() {
  return (
    <div className="min-h-screen py-12 md:py-16 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-6 text-indigo-600">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Legal Compliance
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Understanding the legal framework and compliance of skill-based gaming in India
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Skill vs Chance */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Gavel className="w-6 h-6 text-indigo-600" />
              Skill vs. Chance: Legal Distinction
            </h2>
            <div className="space-y-6 text-slate-600">
              <p className="leading-relaxed">
                Under Indian law, games are classified into two categories: <strong>Games of Skill</strong> and <strong>Games of Chance</strong>. The Supreme Court of India has held that games of skill are protected activities under Article 19(1)(g) of the Constitution.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl">
                  <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Games of Skill (Legal)
                  </h3>
                  <p className="text-sm text-emerald-800 mb-3">
                    Success depends primarily on superior knowledge, training, attention, experience, and adroitness of the player.
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded inline-block">
                    Examples: BGMI, COD Mobile, Free Fire, Chess, Rummy
                  </p>
                </div>

                <div className="bg-rose-50 border border-rose-100 p-5 rounded-xl">
                  <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    Games of Chance (Restricted)
                  </h3>
                  <p className="text-sm text-rose-800 mb-3">
                    Outcome is primarily determined by luck, randomness, or events beyond the player's control.
                  </p>
                  <p className="text-xs font-semibold text-rose-700 bg-rose-100/50 px-2 py-1 rounded inline-block">
                    Examples: Lottery, Slot Machines, Roulette
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Indian Laws */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Book className="w-6 h-6 text-indigo-600" />
              Governing Indian Laws
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">1. Public Gambling Act, 1867</h3>
                <p className="text-slate-600 text-sm">Prohibits operating public gambling houses but explicitly exempts "games of mere skill" from its purview.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">2. IT Act, 2000</h3>
                <p className="text-slate-600 text-sm">Governs online activities and electronic transactions in India, providing the framework for online gaming platforms.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">3. State Gambling Acts</h3>
                <p className="text-slate-600 text-sm">States have the power to legislate on gambling. Some states have specific laws regulating or banning online gaming.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">4. Supreme Court Rulings</h3>
                <p className="text-slate-600 text-sm">Landmark judgments (e.g., KR Lakshmanan vs State of TN) affirm that skill games are business activities, not gambling.</p>
              </div>
            </div>
          </section>

          {/* State-wise Compliance */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-600" />
              State-wise Gaming Status
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left font-semibold text-slate-900">State / Region</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-slate-700">Most Indian States</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> Allowed
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-slate-700">Sikkim, Nagaland</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <FileText className="w-3.5 h-3.5" /> Licensed
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-slate-700">Andhra Pradesh, Telangana, Assam, Odisha</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                        <AlertTriangle className="w-3.5 h-3.5" /> Restricted
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">* Regulations are subject to change. Users must verify laws in their jurisdiction.</p>
          </section>

          {/* Our Compliance */}
          <section className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6">LastRunx's Commitment</h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-500/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm">Only 100% skill-based games hosted</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-500/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm">Zero tolerance for luck-based mechanics</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-500/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm">Strict 18+ age verification (KYC)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-500/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm">Geo-fencing for restricted states</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-500/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm">Secure, compliant payment gateways</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-500/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm">Data privacy (SSL & Encryption)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
            <h2 className="font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Legal Notice
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl mx-auto">
              LastRunx does not promote gambling. All games on this platform are games of skill. Users are advised to play responsibly and comply with their local laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

'use client'

export default function LegalityPage() {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4 px-6 py-2 bg-slate-100 border border-slate-300 rounded-full">
            <span className="text-slate-700 font-semibold text-xs sm:text-sm">⚖️ Legal Framework</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-gradient">
            Legal Compliance
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 font-medium">
            Understanding skill-based gaming laws in India
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Skill vs Chance */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Skill vs. Chance: Legal Distinction</h2>
            <div className="space-y-4 text-slate-600">
              <p className="leading-relaxed">
                Under Indian law, games are classified into two categories: <strong>Games of Skill</strong> and <strong>Games of Chance</strong>.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-slate-800 mb-2">Games of Skill (Legal)</h3>
                <p className="text-sm">Games where success depends primarily on superior knowledge, training, attention, experience, and adroitness of the player.</p>
                <p className="text-sm mt-2"><strong>Examples:</strong> BGMI, COD Mobile, Free Fire Max, Mobile Legends, Rummy, Poker (with skill element), Fantasy Sports</p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-slate-800 mb-2">Games of Chance (Restricted)</h3>
                <p className="text-sm">Games where the outcome is primarily determined by luck, randomness, or events beyond the player's control.</p>
                <p className="text-sm mt-2"><strong>Examples:</strong> Lottery, Slot Machines, Roulette, Teen Patti (pure luck version)</p>
              </div>
            </div>
          </section>

          {/* Indian Laws */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Governing Indian Laws</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-slate-400 pl-4">
                <h3 className="font-bold text-slate-800 mb-2">1. Public Gambling Act, 1867</h3>
                <p className="text-slate-600 text-sm">Prohibits running or being in charge of a public gambling house. However, it exempts games of skill from its purview.</p>
              </div>
              <div className="border-l-4 border-slate-400 pl-4">
                <h3 className="font-bold text-slate-800 mb-2">2. Information Technology Act, 2000</h3>
                <p className="text-slate-600 text-sm">Governs online activities and electronic transactions in India, including online gaming platforms.</p>
              </div>
              <div className="border-l-4 border-slate-400 pl-4">
                <h3 className="font-bold text-slate-800 mb-2">3. State Gambling Acts</h3>
                <p className="text-slate-600 text-sm">Each state has its own gambling legislation. States like Sikkim, Nagaland, and Meghalaya have progressive online gaming regulations.</p>
              </div>
              <div className="border-l-4 border-slate-400 pl-4">
                <h3 className="font-bold text-slate-800 mb-2">4. Supreme Court Rulings</h3>
                <p className="text-slate-600 text-sm"><strong>KR Lakshmanan vs State of Tamil Nadu (1996):</strong> Supreme Court held that games of skill are not gambling and are protected under Article 19(1)(g) of the Constitution (Right to practice any profession).</p>
              </div>
            </div>
          </section>

          {/* State-wise Compliance */}
          <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">State-wise Gaming Status</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-4 py-3 text-left font-semibold text-slate-800">State</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-800">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-3">Most Indian States</td>
                    <td className="px-4 py-3">✅ Skill-based gaming permitted</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-3">Sikkim, Nagaland</td>
                    <td className="px-4 py-3">✅ Licensed online gaming allowed</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-3">Andhra Pradesh, Telangana</td>
                    <td className="px-4 py-3">⚠️ Restrictions on online gaming</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-3">Assam, Odisha</td>
                    <td className="px-4 py-3">⚠️ Some restrictions apply</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-4">*Laws are subject to change. Users should verify current regulations in their state.</p>
          </section>

          {/* Our Compliance */}
          <section className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-300 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">LastRunx's Legal Compliance</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Only 100% skill-based games (BGMI, Free Fire Max, COD Mobile, Mobile Legends, Clash Royale)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>No games of chance or luck-based mechanics</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Transparent terms and conditions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Age verification (18+ only)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>State-wise access control</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Responsible gaming practices</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Secure payment gateways</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">✓</span>
                <span>Data protection and privacy compliance</span>
              </li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">⚖️ Legal Notice</h2>
            <div className="space-y-3 text-slate-700 text-sm">
              <p>Users are advised to check their local state laws before participating in any real-money skill gaming. Legal interpretations may vary by jurisdiction.</p>
              <p className="font-semibold text-blue-800">We do not encourage gambling or games of chance. All showcased games are purely skill-based.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

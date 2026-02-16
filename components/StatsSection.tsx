'use client'

import { Users, ShieldCheck, Trophy, Banknote } from 'lucide-react'

export function StatsSection() {
  const stats = [
    {
      number: '50K+',
      label: 'Active Players',
      icon: <Users className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '₹10L+',
      label: 'Monthly Payouts',
      icon: <Banknote className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      number: '100%',
      label: 'Legal & Secure',
      icon: <ShieldCheck className="w-8 h-8" />,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      number: '24/7',
      label: 'Active Tournaments',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500'
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all group text-center"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { Target, Scale, Shield, Smartphone, Trophy, Gem } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: <Target className="w-7 h-7" />,
      title: '100% Skill-Based',
      description: 'Pure skill, no luck. Compete in BGMI, Free Fire Max, and more on a level playing field.',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Scale className="w-7 h-7" />,
      title: 'Legal Compliance',
      description: 'Fully compliant with Indian laws. Transparent operations with state-wise restrictions handled automatically.',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Fair Play Guarantee',
      description: 'Advanced anti-cheat measures and 24/7 monitoring to ensure every match is fair.',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: 'Mobile-First Design',
      description: 'Optimized for the best mobile experience. Play seamlessly on any device.',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      icon: <Trophy className="w-7 h-7" />,
      title: 'Competitive Leagues',
      description: 'Join tiered leagues and tournaments. Rise through the ranks and prove your dominance.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <Gem className="w-7 h-7" />,
      title: 'Premium Experience',
      description: 'Ad-free gaming environment with instant withdrawals and priority support.',
      gradient: 'from-cyan-500 to-blue-600'
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            Why Choose Us
          </div>
          <h2 className="mt-2 text-4xl sm:text-5xl font-bold text-slate-900">
            The <span className="text-gradient-blue">Professional's</span> Choice
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Built for serious gamers who demand fairness, security, and performance in every match.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-200 shadow-md hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon as any}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

export function StatsSection() {
  const stats = [
    { number: '100%', label: 'Skill-Based' },
    { number: '✓', label: 'Legal Compliant' },
    { number: '₹10+', label: 'Min Entry' },
    { number: '5K+', label: 'Active Players' },
  ]

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-12 md:mb-16 animate-fade-in">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative glass-effect bg-gradient-to-br from-slate-100 via-gray-50 to-white rounded-2xl p-4 sm:p-6 md:p-8 text-center hover:transform hover:scale-110 transition-all duration-300 border-2 border-slate-200 hover:border-blue-400 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/0 to-blue-500/0 group-hover:from-slate-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gradient mb-1 sm:mb-2">
                {stat.number}
              </div>
              <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

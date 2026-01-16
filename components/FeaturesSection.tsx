'use client'

export function FeaturesSection() {
  const features = [
    {
      icon: '�',
      title: '100% Skill-Based',
      description: 'BGMI, Free Fire Max, COD Mobile, Mobile Legends. Pure skill, no luck.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⚖️',
      title: 'Legal Compliance',
      description: 'Transparent operations with state-wise legal guidance.',
      gradient: 'from-slate-600 to-slate-800'
    },
    {
      icon: '🛡️',
      title: 'Fair Play',
      description: 'Anti-cheat measures and transparent dispute resolution.',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: '📱',
      title: 'Mobile-First',
      description: 'Designed for Indian mobile gamers with easy access.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏆',
      title: 'Competitive',
      description: 'Regular tournaments with skilled players from across India.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '💎',
      title: 'Premium Experience',
      description: 'Professional platform with seamless gaming experience.',
      gradient: 'from-indigo-500 to-blue-600'
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-12 md:mb-20">
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-block mb-4 px-6 py-2 bg-slate-100 border border-slate-300 rounded-full">
          <span className="text-slate-700 font-semibold text-xs sm:text-sm">✨ Our Features</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-4 text-gradient">
          Why LastRunx?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">Experience the best skill-based gaming platform in India</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 text-center hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 overflow-hidden"
          >
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 to-blue-50/0 group-hover:from-slate-50 group-hover:to-blue-50 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className={`inline-block p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ${
                index === 1 ? 'bg-slate-200' : `bg-gradient-to-br ${feature.gradient} bg-opacity-10`
              }`}>
                <span className="text-4xl sm:text-5xl drop-shadow-lg">{feature.icon}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

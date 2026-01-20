'use client'

import Image from 'next/image'
import Link from 'next/link'

export function GamesShowcase() {
  const games = [
    {
      name: 'BGMI',
      icon: '🎯',
      image: '/images/games/bgmi.avif',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      glowColor: 'rgba(251, 146, 60, 0.4)'
    },
    {
      name: 'Free Fire Max',
      icon: '🔥',
      image: '/images/games/ff-max.jpg',
      gradient: 'from-yellow-400 via-orange-500 to-red-600',
      glowColor: 'rgba(251, 191, 36, 0.4)'
    },
    {
      name: 'COD Mobile',
      icon: '🔫',
      image: '/images/games/codm.webp',
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      glowColor: 'rgba(52, 211, 153, 0.4)'
    },
    {
      name: 'Mobile Legends',
      icon: '⚔️',
      image: '/images/games/mlbb.jpg',
      gradient: 'from-purple-500 via-pink-500 to-rose-600',
      glowColor: 'rgba(168, 85, 247, 0.4)'
    },
    {
      name: 'Clash Royale',
      icon: '👑',
      image: '/images/games/clashroyale.webp',
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      glowColor: 'rgba(59, 130, 246, 0.4)'
    }
  ]

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-12 md:mb-20">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-block mb-4 px-6 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-full shadow-lg">
          <span className="text-blue-700 font-bold text-xs sm:text-sm flex items-center gap-2">
            <span className="animate-pulse">🎮</span> Featured Games
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Choose Your Battle
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium">
          Master your favorite game and compete with the best players in India
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {games.map((game, index) => (
          <Link
            key={index}
            href="/tournaments"
            className="game-card group relative overflow-hidden rounded-2xl border-2 border-transparent hover:border-white transition-all duration-500 transform hover:scale-105 hover:-translate-y-3"
            style={{
              boxShadow: `0 10px 30px -10px ${game.glowColor}, 0 0 0 1px rgba(255,255,255,0.1)`
            }}
          >
            {/* Premium Glass Effect Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"></div>
            
            {/* Animated Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="shine-effect"></div>
            </div>

            {/* Image Container */}
            <div className="relative h-40 sm:h-48 overflow-hidden">
              <Image
                src={game.image}
                alt={game.name}
                fill
                className="object-cover group-hover:scale-125 group-hover:rotate-3 transition-all duration-700"
              />
              
              {/* Premium Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${game.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-500 mix-blend-multiply`}></div>
              
              {/* Dark Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

              {/* Animated Particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="game-particle game-particle-1"></div>
                <div className="game-particle game-particle-2"></div>
                <div className="game-particle game-particle-3"></div>
              </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              {/* Icon with Glow */}
              <div className="relative mb-2">
                <div className={`absolute inset-0 blur-2xl bg-gradient-to-r ${game.gradient} opacity-50 group-hover:opacity-75 transition-opacity scale-150`}></div>
                <div className="relative text-5xl sm:text-6xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-2xl filter">
                  {game.icon}
                </div>
              </div>
              
              {/* Game Name */}
              <h3 className="relative text-white font-black text-lg sm:text-xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 text-center px-2">
                {game.name}
              </h3>
              
              {/* Premium Play Button */}
              <div className="mt-3 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-xl">
                <span className="text-white text-xs font-bold tracking-wide flex items-center gap-2">
                  Play Now 
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>

              {/* Top Corner Badge */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-[10px] font-bold">HOT</span>
              </div>
            </div>

            {/* Bottom Glow Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          </Link>
        ))}
      </div>
    </section>
  )
}

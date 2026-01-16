'use client'

import Image from 'next/image'
import Link from 'next/link'

export function GamesShowcase() {
  const games = [
    {
      name: 'BGMI',
      icon: '🎯',
      image: '/images/games/bgmi.avif',
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Free Fire Max',
      icon: '🔥',
      image: '/images/games/ff-max.jpg',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      name: 'COD Mobile',
      icon: '🔫',
      image: '/images/games/codm.webp',
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Mobile Legends',
      icon: '⚔️',
      image: '/images/games/mlbb.jpg',
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Clash Royale',
      icon: '👑',
      image: '/images/games/clashroyale.webp',
      color: 'from-blue-500 to-purple-600'
    }
  ]

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-12 md:mb-20">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 rounded-full">
          <span className="text-blue-700 font-semibold text-xs sm:text-sm">🎮 Featured Games</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-3 text-gradient">
          Choose Your Battle
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Master your favorite game and compete with the best players in India
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {games.map((game, index) => (
          <Link
            key={index}
            href="/tournaments"
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
          >
            <div className="relative h-40 sm:h-48">
              <Image
                src={game.image}
                alt={game.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${game.color} opacity-60 group-hover:opacity-70 transition-opacity`}></div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl sm:text-6xl mb-2 transform group-hover:scale-125 transition-transform duration-300 drop-shadow-2xl">
                {game.icon}
              </div>
              <h3 className="text-white font-black text-lg sm:text-xl drop-shadow-lg">
                {game.name}
              </h3>
              <div className="mt-2 px-4 py-1 bg-white/20 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-semibold">Play Now →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

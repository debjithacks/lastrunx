'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FlaticonIcon } from './FlaticonIcon'

export function GamesShowcase() {
  const games = [
    {
      name: 'BGMI',
      icon: 'gamepad',
      iconColor: 'text-orange-500',
      image: '/images/games/bgmi.avif',
      color: 'from-orange-500 to-red-500',
      description: 'Battle Royale'
    },
    {
      name: 'Free Fire Max',
      icon: 'rocket',
      iconColor: 'text-red-500',
      image: '/images/games/ff-max.jpg',
      color: 'from-red-500 to-pink-500',
      description: 'Survival Shooter'
    },
    {
      name: 'COD Mobile',
      icon: 'star',
      iconColor: 'text-emerald-500',
      image: '/images/games/codm.webp',
      color: 'from-emerald-500 to-teal-500',
      description: 'FPS Action'
    },
    {
      name: 'Mobile Legends',
      icon: 'shield',
      iconColor: 'text-purple-500',
      image: '/images/games/mlbb.jpg',
      color: 'from-purple-500 to-indigo-500',
      description: '5v5 MOBA'
    },
    {
      name: 'Clash Royale',
      icon: 'trophy',
      iconColor: 'text-blue-500',
      image: '/images/games/clashroyale.webp',
      color: 'from-blue-500 to-cyan-500',
      description: 'Strategy'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            Popular Games
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Choose Your <span className="text-gradient-blue">Arena</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Compete in your favorite mobile games. New tournaments added daily with guaranteed prize pools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {games.map((game, index) => (
            <Link
              key={index}
              href="/tournaments"
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200 flex flex-col hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

                {/* Overlay Content */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700">
                    {game.description}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${game.color} bg-opacity-10 border border-slate-100`}>
                      <FlaticonIcon name={game.icon} style="bold" className={`text-xl ${game.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">
                      {game.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Join Tournament</span>
                  <FlaticonIcon name="arrow-small-right" style="bold" className="text-base transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Tournament {
  id: number
  game: string
  title: string
  image: string
  entryFee: string
  prizePool: string
  players: string
  startTime: string
  skill: string
}

export default function TournamentsPage() {
  const [selectedGame, setSelectedGame] = useState('all')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const tournaments: Tournament[] = [
    // BGMI Tournaments
    {
      id: 1,
      game: 'BGMI',
      title: 'BGMI Solo Classic',
      image: '/images/games/bgmi.avif',
      entryFee: '₹25',
      prizePool: '₹2,500',
      players: '56/100',
      startTime: '2 hours',
      skill: '100% Skill'
    },
    {
      id: 2,
      game: 'BGMI',
      title: 'BGMI Duo Championship',
      image: '/images/games/bgmi.avif',
      entryFee: '₹40',
      prizePool: '₹4,000',
      players: '30/50',
      startTime: '3 hours',
      skill: '100% Skill'
    },
    {
      id: 3,
      game: 'BGMI',
      title: 'BGMI Squad Battle',
      image: '/images/games/bgmi.avif',
      entryFee: '₹50',
      prizePool: '₹5,000',
      players: '24/100',
      startTime: '4 hours',
      skill: '100% Skill'
    },
    // Free Fire Max Tournaments
    {
      id: 4,
      game: 'Free Fire Max',
      title: 'FF Max Solo Rush',
      image: '/images/games/ff-max.jpg',
      entryFee: '₹20',
      prizePool: '₹2,000',
      players: '42/100',
      startTime: '1 hour',
      skill: '100% Skill'
    },
    {
      id: 5,
      game: 'Free Fire Max',
      title: 'FF Max Duo Showdown',
      image: '/images/games/ff-max.jpg',
      entryFee: '₹35',
      prizePool: '₹3,500',
      players: '26/50',
      startTime: '2 hours',
      skill: '100% Skill'
    },
    {
      id: 6,
      game: 'Free Fire Max',
      title: 'FF Max Squad Arena',
      image: '/images/games/ff-max.jpg',
      entryFee: '₹45',
      prizePool: '₹4,500',
      players: '18/80',
      startTime: '5 hours',
      skill: '100% Skill'
    },
    // COD Mobile Tournaments
    {
      id: 7,
      game: 'COD Mobile',
      title: 'COD Mobile Battle Royale',
      image: '/images/games/codm.webp',
      entryFee: '₹30',
      prizePool: '₹3,000',
      players: '18/80',
      startTime: '3 hours',
      skill: '100% Skill'
    },
    {
      id: 8,
      game: 'COD Mobile',
      title: 'COD TDM Championship',
      image: '/images/games/codm.webp',
      entryFee: '₹35',
      prizePool: '₹3,500',
      players: '12/50',
      startTime: '6 hours',
      skill: '100% Skill'
    },
    // MOBA Games
    {
      id: 9,
      game: 'Mobile Legends',
      title: 'MLBB 5v5 Championship',
      image: '/images/games/mlbb.jpg',
      entryFee: '₹60',
      prizePool: '₹6,000',
      players: '8/16',
      startTime: '4 hours',
      skill: '100% Skill'
    },
    {
      id: 10,
      game: 'Mobile Legends',
      title: 'MLBB Ranked Push',
      image: '/images/games/mlbb.jpg',
      entryFee: '₹40',
      prizePool: '₹4,000',
      players: '15/32',
      startTime: '7 hours',
      skill: '100% Skill'
    },
    // Other Games
    {
      id: 11,
      game: 'Clash Royale',
      title: 'Clash Royale Arena Battle',
      image: '/images/games/clashroyale.webp',
      entryFee: '₹40',
      prizePool: '₹4,000',
      players: '45/128',
      startTime: '3 hours',
      skill: '100% Skill'
    }
  ]

  const games = ['all', 'BGMI', 'Free Fire Max', 'COD Mobile', 'Mobile Legends', 'Clash Royale']

  const filteredTournaments = selectedGame === 'all' 
    ? tournaments 
    : tournaments.filter(t => t.game === selectedGame)

  return (
    <div className="min-h-screen py-8 md:py-12 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-block mb-4 px-6 py-2 bg-slate-100 border border-slate-300 rounded-full animate-bounce-slow">
            <span className="text-slate-700 font-semibold text-xs sm:text-sm">
              <span className="inline-block animate-pulse">🔴</span> Live Tournaments
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-gradient animate-gradient">
            Skill Tournaments
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 font-medium">
            Join 100% skill-based gaming tournaments and compete with the best
          </p>
        </div>

        {/* Filter */}
        <div className={`mb-6 md:mb-8 flex justify-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex flex-wrap gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-lg">
            {games.map((game, index) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`px-4 sm:px-5 md:px-7 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-300 text-xs sm:text-sm md:text-base animate-slide-in ${
                  selectedGame === game
                    ? 'bg-gradient-to-r from-slate-800 to-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100 hover:scale-105 bg-slate-50'
                }`}
              >
                {game === 'all' ? '🎮 All Games' : game}
              </button>
            ))}
          </div>
        </div>

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8">
          {filteredTournaments.map((tournament, index) => (
            <div
              key={tournament.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`group bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 animate-fade-in-up card-float card-tilt ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              {/* Game Image */}
              <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden">
                <Image
                  src={tournament.image}
                  alt={tournament.game}
                  fill
                  className="object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-500"
                />
                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-slate-800/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white animate-pulse-slow">
                  {tournament.game}
                </div>
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-blue-600/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white shimmer">
                  ✨ {tournament.skill}
                </div>
                
                {/* Live Indicator */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-3 sm:mb-4 group-hover:text-blue-600 transition group-hover:scale-105 transform">
                  {tournament.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
                  <div className="transform hover:scale-110 transition">
                    <p className="text-gray-500 text-xs font-medium mb-1.5">💰 Entry Fee</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{tournament.entryFee}</p>
                  </div>
                  <div className="transform hover:scale-110 transition">
                    <p className="text-gray-500 text-xs font-medium mb-1.5">🏆 Prize Pool</p>
                    <p className="font-bold text-green-600 shimmer-text text-sm sm:text-base">{tournament.prizePool}</p>
                  </div>
                  <div className="transform hover:scale-110 transition">
                    <p className="text-gray-500 text-xs font-medium mb-1.5">👥 Players</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{tournament.players}</p>
                  </div>
                  <div className="transform hover:scale-110 transition">
                    <p className="text-gray-500 text-xs font-medium mb-1.5">⏱️ Starts In</p>
                    <p className="font-bold text-blue-600 animate-pulse text-sm sm:text-base">{tournament.startTime}</p>
                  </div>
                </div>

                <button className="w-full bg-white border-2 border-slate-300 text-slate-800 py-2 sm:py-2.5 md:py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm sm:text-base hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:border-blue-500 hover:text-white hover:shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden group-btn">
                  <span className="relative z-10">Join Tournament →</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-btn-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes particle {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(100vw, 100vh) rotate(360deg); opacity: 0; }
        }
        
        .animate-gradient {
          background: linear-gradient(270deg, #1e293b, #3b82f6, #8b5cf6, #1e293b);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient 8s ease infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        
        .card-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .card-tilt {
          transition: transform 0.3s ease;
        }
        
        .card-tilt:hover {
          transform: perspective(1000px) rotateX(5deg) rotateY(5deg) translateY(-10px);
        }
        
        .shimmer {
          background: linear-gradient(90deg, rgba(59,130,246,0.9) 0%, rgba(255,255,255,0.9) 50%, rgba(59,130,246,0.9) 100%);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        
        .shimmer-text {
          background: linear-gradient(90deg, #22c55e 0%, #86efac 50%, #22c55e 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .particle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%);
          border-radius: 50%;
          animation: particle 20s linear infinite;
        }
        
        .particle-1 { animation-delay: 0s; top: 10%; left: 10%; }
        .particle-2 { animation-delay: 4s; top: 30%; left: 80%; }
        .particle-3 { animation-delay: 8s; top: 50%; left: 20%; }
        .particle-4 { animation-delay: 12s; top: 70%; left: 60%; }
        .particle-5 { animation-delay: 16s; top: 20%; left: 50%; }
      `}</style>
    </div>
  )
}

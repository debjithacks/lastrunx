'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Trophy, Users, Clock, Zap, Target, Search, Filter, Gamepad2, Banknote, ShieldCheck, PlayCircle, ArrowRight } from 'lucide-react'

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
  isLive?: boolean
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
      skill: '100% Skill',
      isLive: true
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
      skill: '100% Skill',
      isLive: true
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
    <div className="min-h-screen py-12 md:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Live Tournaments</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Tournament Arena
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Choose your game, prove your skill, and win real cash prize pools.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-4 no-scrollbar">
          <div className="inline-flex items-center p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm gap-1">
            {games.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedGame === game
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {game === 'all' ? 'All Games' : game}
              </button>
            ))}
          </div>
        </div>

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-indigo-100"
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <Image
                  src={tournament.image}
                  alt={tournament.game}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    {tournament.game}
                  </div>
                  {tournament.isLive && (
                    <div className="px-2.5 py-1 bg-red-500/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 animate-pulse">
                      LIVE
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                    <ShieldCheck className="w-4 h-4" />
                    {tournament.skill}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-5 group-hover:text-indigo-600 transition-colors">
                  {tournament.title}
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5" />
                      Entry Fee
                    </p>
                    <p className="text-sm font-bold text-slate-900">{tournament.entryFee}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      Prize Pool
                    </p>
                    <p className="text-sm font-bold text-emerald-600">{tournament.prizePool}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Players
                    </p>
                    <p className="text-sm font-bold text-slate-900">{tournament.players}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Starts In
                    </p>
                    <p className="text-sm font-bold text-indigo-600">{tournament.startTime}</p>
                  </div>
                </div>

                <button className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:translate-y-[-2px]">
                  <span>Join Tournament</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

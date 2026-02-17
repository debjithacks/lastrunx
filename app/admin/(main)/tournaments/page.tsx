'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Trophy, Users, DollarSign, Calendar, Clock, Play, CheckCircle,
  TrendingUp, AlertCircle, Gamepad2, Activity, Plus
} from 'lucide-react'

interface Tournament {
  id: string
  title: string
  gameType: string
  entryFee: number
  prizePool: number
  maxPlayers: number
  startTime: Date
  status: string
  _count: {
    registrations: number
  }
}

export default function TournamentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'LIVE' | 'UPCOMING' | 'COMPLETED'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchTournaments()
    }
  }, [status])

  const fetchTournaments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tournaments')
      const data = await res.json()
      setTournaments(Array.isArray(data) ? data : data.tournaments || [])
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTournaments = tournaments.filter(t => 
    filter === 'all' ? true : t.status === filter
  )

  const stats = {
    total: tournaments.length,
    live: tournaments.filter(t => t.status === 'LIVE').length,
    upcoming: tournaments.filter(t => t.status === 'UPCOMING').length,
    totalPrize: tournaments.reduce((sum, t) => sum + t.prizePool, 0),
    totalPlayers: tournaments.reduce((sum, t) => sum + t._count.registrations, 0)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Tournaments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl blur-3xl -z-10"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tournaments</h1>
              <p className="text-slate-600 text-sm mt-0.5">Manage and monitor all tournaments</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Tournament
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Tournaments"
          value={stats.total.toString()}
          icon={<Trophy className="w-5 h-5" />}
          gradient="from-purple-500 to-pink-600"
        />
        <StatCard 
          title="Live Now"
          value={stats.live.toString()}
          icon={<Play className="w-5 h-5" />}
          gradient="from-rose-500 to-red-600"
          pulse={stats.live > 0}
        />
        <StatCard 
          title="Upcoming"
          value={stats.upcoming.toString()}
          icon={<Calendar className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard 
          title="Total Prize Pool"
          value={`₹${(stats.totalPrize/1000).toFixed(0)}K`}
          icon={<DollarSign className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard 
          title="Total Players"
          value={stats.totalPlayers.toString()}
          icon={<Users className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-3 rounded-xl font-semibold transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('LIVE')}
          className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            filter === 'LIVE'
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {stats.live > 0 && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
          Live
        </button>
        <button
          onClick={() => setFilter('UPCOMING')}
          className={`px-5 py-3 rounded-xl font-semibold transition-all ${
            filter === 'UPCOMING'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-5 py-3 rounded-xl font-semibold transition-all ${
            filter === 'COMPLETED'
              ? 'bg-gradient-to-r from-slate-500 to-slate-700 text-white shadow-lg shadow-slate-500/30'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Trophy className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold text-lg">No tournaments found</p>
          <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or create a new tournament</p>
        </div>
      )}
    </div>
  )
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const fillPercentage = (tournament._count.registrations / tournament.maxPlayers) * 100
  const isAlmostFull = fillPercentage >= 80

  const statusConfig = {
    LIVE: {
      gradient: 'from-rose-500 to-red-600',
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      icon: <Play className="w-4 h-4" />,
      pulse: true
    },
    UPCOMING: {
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: <Calendar className="w-4 h-4" />,
      pulse: false
    },
    COMPLETED: {
      gradient: 'from-slate-500 to-slate-700',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      icon: <CheckCircle className="w-4 h-4" />,
      pulse: false
    }
  }

  const config = statusConfig[tournament.status as keyof typeof statusConfig] || statusConfig.UPCOMING

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${config.gradient}`}></div>

      <div className="p-6">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
              {tournament.title}
            </h3>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">{tournament.gameType}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text} font-bold text-xs ${config.pulse ? 'animate-pulse' : ''}`}>
            {config.icon}
            {tournament.status}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-semibold">Prize Pool</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">₹{tournament.prizePool.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-semibold">Entry Fee</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">₹{tournament.entryFee}</p>
          </div>
        </div>

        {/* Players Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="w-4 h-4" />
              Players
            </div>
            <span className={`text-sm font-bold ${isAlmostFull ? 'text-rose-600' : 'text-slate-600'}`}>
              {tournament._count.registrations}/{tournament.maxPlayers}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isAlmostFull 
                  ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-600'
              }`}
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Start Time */}
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {new Date(tournament.startTime).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </span>
        </div>
      </div>

      {/* Hover Effect Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  pulse
}: {
  title: string
  value: string
  icon: React.ReactNode
  gradient: string
  pulse?: boolean
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-3 ${pulse ? 'animate-pulse' : ''}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  )
}

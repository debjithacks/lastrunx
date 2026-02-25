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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tournaments</h1>
            <p className="text-slate-600 text-sm mt-0.5">Manage and monitor all tournaments</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Tournament
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Tournaments"
          value={stats.total.toString()}
          icon={<Trophy className="w-5 h-5" />}
        />
        <StatCard 
          title="Live Now"
          value={stats.live.toString()}
          icon={<Play className="w-5 h-5" />}
          pulse={stats.live > 0}
        />
        <StatCard 
          title="Upcoming"
          value={stats.upcoming.toString()}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard 
          title="Total Prize Pool"
          value={`₹${(stats.totalPrize/1000).toFixed(0)}K`}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard 
          title="Total Players"
          value={stats.totalPlayers.toString()}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-3 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('LIVE')}
          className={`px-5 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            filter === 'LIVE'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {stats.live > 0 && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
          Live
        </button>
        <button
          onClick={() => setFilter('UPCOMING')}
          className={`px-5 py-3 rounded-lg font-semibold transition-colors ${
            filter === 'UPCOMING'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-5 py-3 rounded-lg font-semibold transition-colors ${
            filter === 'COMPLETED'
              ? 'bg-blue-600 text-white'
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
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
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
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: <Play className="w-4 h-4" />,
      pulse: true
    },
    UPCOMING: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: <Calendar className="w-4 h-4" />,
      pulse: false
    },
    COMPLETED: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      icon: <CheckCircle className="w-4 h-4" />,
      pulse: false
    }
  }

  const config = statusConfig[tournament.status as keyof typeof statusConfig] || statusConfig.UPCOMING

  return (
    <div className="group relative bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
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
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-semibold">Prize Pool</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{tournament.prizePool.toLocaleString()}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-semibold">Entry Fee</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{tournament.entryFee}</p>
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
              className="h-full bg-blue-600 transition-all duration-500"
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
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  pulse
}: {
  title: string
  value: string
  icon: React.ReactNode
  pulse?: boolean
}) {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-colors">
      <div className={`inline-flex p-3 rounded-lg bg-slate-100 text-slate-700 mb-3 ${pulse ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
    </div>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  BarChart2, Trophy, Target, TrendingUp, Gamepad2, Crown,
  Loader2, Calendar, Award, Zap
} from 'lucide-react'

interface Stats {
  totalTournaments: number
  activeTournaments: number
  completedTournaments: number
  totalWinnings: string
  totalSpent: string
  winRate: number
  recentRegistrations: Array<{
    id: string
    tournament: {
      id: string
      title: string
      game: string
      entryFee: string
      status: string
      startTime: string
    }
    createdAt: string
  }>
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/stats')
      const data = await res.json()

      if (res.ok && data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading stats...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Stats Available</h2>
          <p className="text-slate-500 mb-6">Start playing tournaments to see your stats</p>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Browse Tournaments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">My Stats</h1>
          </div>
          <p className="text-slate-500">Track your tournament performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tournaments */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Trophy className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                ALL TIME
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalTournaments}</p>
            <p className="text-sm text-slate-500 font-medium">Total Tournaments</p>
          </div>

          {/* Active Tournaments */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                ACTIVE
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.activeTournaments}</p>
            <p className="text-sm text-slate-500 font-medium">Active Tournaments</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                DONE
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.completedTournaments}</p>
            <p className="text-sm text-slate-500 font-medium">Completed</p>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                RATE
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.winRate.toFixed(1)}%</p>
            <p className="text-sm text-slate-500 font-medium">Win Rate</p>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Winnings */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Crown className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-6 h-6" />
                <p className="text-green-100 font-medium">Total Winnings</p>
              </div>
              <p className="text-4xl font-bold">₹{parseFloat(stats.totalWinnings).toFixed(2)}</p>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-6 h-6" />
                <p className="text-indigo-100 font-medium">Total Spent</p>
              </div>
              <p className="text-4xl font-bold">₹{parseFloat(stats.totalSpent).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Recent Tournaments */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Tournaments
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentRegistrations.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No tournaments yet</p>
                <p className="text-sm text-slate-400 mt-1">Join your first tournament to get started</p>
                <Link
                  href="/tournaments"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Browse Tournaments
                </Link>
              </div>
            ) : (
              stats.recentRegistrations.map((registration) => (
                <div key={registration.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <Gamepad2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{registration.tournament.title}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-slate-500">{registration.tournament.game}</p>
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            registration.tournament.status === 'UPCOMING' 
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : registration.tournament.status === 'LIVE'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : 'bg-slate-50 text-slate-700 border-slate-100'
                          }`}>
                            {registration.tournament.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        Entry: ₹{parseFloat(registration.tournament.entryFee).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(registration.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      <Link
                        href={`/tournaments/${registration.tournament.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

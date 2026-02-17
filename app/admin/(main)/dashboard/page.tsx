'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, DollarSign, Trophy, ArrowUpRight, ArrowDownRight,
  Activity, UserPlus, ClipboardCheck, PlayCircle, CheckCircle,
  FileText, AlertTriangle, Gamepad2, TrendingUp, TrendingDown,
  Zap, BarChart3, PieChart, Calendar, Clock
} from 'lucide-react'

interface Analytics {
  revenue: {
    totalDeposits: number
    totalWithdrawals: number
    tournamentFees: number
    fines: number
    promotionalExpense: number
    netRevenue: number
    depositCount: number
    withdrawalCount: number
  }
  users: {
    total: number
    active: number
    new: number
    kycPending: number
  }
  tournaments: {
    total: number
    live: number
    completed: number
    registrations: number
  }
  gameRevenue: Record<string, number>
  pendingDisputes: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [period, setPeriod] = useState('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status, period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Basic fallback could be implemented here
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-700">Loading Dashboard</p>
            <p className="text-sm text-slate-500 mt-1">Fetching your analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-8">
      {/* Header with enhanced design */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl -z-10"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-600 text-sm mt-0.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live Analytics & Performance Metrics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-3 hidden lg:block">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Viewing Period</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none shadow-sm cursor-pointer transition-all"
            >
              <option value="today">📅 Today</option>
              <option value="week">📊 This Week</option>
              <option value="month">📈 This Month</option>
              <option value="all">🌐 All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${(analytics?.revenue?.netRevenue || 0).toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
        <MetricCard
          title="Active Users"
          value={(analytics?.users?.active || 0).toLocaleString()}
          subtitle={`of ${analytics?.users?.total || 0} total`}
          change="+8.2%"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-600"
        />
        <MetricCard
          title="Live Tournaments"
          value={(analytics?.tournaments?.live || 0).toLocaleString()}
          subtitle={`${analytics?.tournaments?.total || 0} total events`}
          change="+3"
          trend="up"
          icon={<Trophy className="w-5 h-5" />}
          gradient="from-purple-500 to-pink-600"
          pulse
        />
        <MetricCard
          title="Registrations"
          value={(analytics?.tournaments?.registrations || 0).toLocaleString()}
          change="+15.3%"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="from-orange-500 to-red-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Analytics - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Financial Overview</h2>
                    <p className="text-xs text-slate-600 mt-0.5">Revenue breakdown and transactions</p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <FinanceCard
                  label="Total Deposits"
                  amount={analytics?.revenue?.totalDeposits || 0}
                  count={analytics?.revenue?.depositCount || 0}
                  icon={<ArrowDownRight className="w-4 h-4" />}
                  color="blue"
                />
                <FinanceCard
                  label="Withdrawals"
                  amount={analytics?.revenue?.totalWithdrawals || 0}
                  count={analytics?.revenue?.withdrawalCount || 0}
                  icon={<ArrowUpRight className="w-4 h-4" />}
                  color="rose"
                />
                <FinanceCard
                  label="Tournament Fees"
                  amount={analytics?.revenue?.tournamentFees || 0}
                  icon={<Trophy className="w-4 h-4" />}
                  color="purple"
                />
                <FinanceCard
                  label="Fines Collected"
                  amount={analytics?.revenue?.fines || 0}
                  icon={<AlertTriangle className="w-4 h-4" />}
                  color="amber"
                />
              </div>
            </div>
          </div>

          {/* Game Revenue Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Gamepad2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Game Performance</h2>
                    <p className="text-xs text-slate-600 mt-0.5">Revenue by game title</p>
                  </div>
                </div>
                <PieChart className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(analytics?.gameRevenue || {}).map(([game, revenue], index) => (
                  <div key={game} className="group relative">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-transparent hover:from-indigo-50 hover:to-purple-50/30 border border-slate-100 hover:border-indigo-200 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{game}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Tournament revenue</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">₹{Number(revenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Total earnings</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                        style={{ width: `${Math.min((Number(revenue) / Math.max(...Object.values(analytics?.gameRevenue || {}))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {Object.keys(analytics?.gameRevenue || {}).length === 0 && (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No game revenue data yet</p>
                    <p className="text-xs text-slate-400 mt-1">Revenue will appear as tournaments are completed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* User Stats */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">User Statistics</h3>
              </div>
              <div className="space-y-4">
                <UserStat label="Total Users" value={analytics?.users?.total || 0} icon={<Users className="w-4 h-4" />} />
                <UserStat label="Active Users" value={analytics?.users?.active || 0} icon={<Activity className="w-4 h-4" />} />
                <UserStat label="New Signups" value={analytics?.users?.new || 0} icon={<UserPlus className="w-4 h-4" />} />
                <UserStat label="KYC Pending" value={analytics?.users?.kycPending || 0} icon={<ClipboardCheck className="w-4 h-4" />} alert={analytics?.users?.kycPending > 0} />
              </div>
            </div>
          </div>

          {/* Tournament Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Tournament Status</h3>
            </div>
            <div className="space-y-3">
              <TournamentStat 
                label="Total Events"
                value={analytics?.tournaments?.total || 0}
                color="slate"
              />
              <TournamentStat 
                label="Live Now"
                value={analytics?.tournaments?.live || 0}
                color="emerald"
                pulse
              />
              <TournamentStat 
                label="Completed"
                value={analytics?.tournaments?.completed || 0}
                color="blue"
              />
            </div>
          </div>

          {/* Alert Card */}
          {(analytics?.pendingDisputes || 0) > 0 ? (
            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-20">
                <AlertTriangle className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5" />
                  <p className="text-sm font-bold uppercase tracking-wider">Action Required</p>
                </div>
                <h3 className="text-3xl font-bold mb-2">{analytics?.pendingDisputes}</h3>
                <p className="text-white/90 text-sm mb-4">Pending disputes need your review</p>
                <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-semibold transition-all">
                  Review Now →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-bold uppercase tracking-wider">All Clear</p>
              </div>
              <p className="text-white/90">No pending disputes or urgent actions required.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Modern Professional Components

function MetricCard({
  title,
  value,
  subtitle,
  change,
  trend,
  icon,
  gradient,
  pulse
}: {
  title: string
  value: string
  subtitle?: string
  change?: string
  trend?: 'up' | 'down'
  icon: React.ReactNode
  gradient: string
  pulse?: boolean
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${pulse ? 'animate-pulse' : ''}`}>
            {icon}
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-slate-50 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  )
}

function FinanceCard({
  label,
  amount,
  count,
  icon,
  color
}: {
  label: string
  amount: number
  count?: number
  icon: React.ReactNode
  color: 'blue' | 'rose' | 'purple' | 'amber'
}) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  }

  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-slate-600">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">₹{amount.toLocaleString()}</p>
      {count !== undefined && (
        <p className="text-xs text-slate-500 mt-1">{count} transactions</p>
      )}
    </div>
  )
}

function UserStat({
  label,
  value,
  icon,
  alert
}: {
  label: string
  value: number
  icon: React.ReactNode
  alert?: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${alert ? 'bg-red-500/20 border border-red-400/30' : 'bg-white/10 backdrop-blur-sm'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-xl font-bold">{value.toLocaleString()}</span>
    </div>
  )
}

function TournamentStat({
  label,
  value,
  color,
  pulse
}: {
  label: string
  value: number
  color: 'slate' | 'emerald' | 'blue'
  pulse?: boolean
}) {
  const colorStyles = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`text-lg font-bold px-3 py-1 rounded-lg ${colorStyles[color]} ${pulse ? 'animate-pulse' : ''}`}>
        {value}
      </span>
    </div>
  )
}

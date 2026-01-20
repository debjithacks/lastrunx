'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

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
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-slate-600">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!analytics) return null

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Dashboard</h1>
            <p className="text-slate-600 mt-1">Overview of platform analytics</p>
          </div>
          
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Net Revenue"
            value={`₹${analytics.revenue.netRevenue.toLocaleString()}`}
            icon="💰"
            color="green"
            period={period}
          />
          <StatCard
            title="Total Deposits"
            value={`₹${analytics.revenue.totalDeposits.toLocaleString()}`}
            subtitle={`${analytics.revenue.depositCount} transactions`}
            icon="⬆️"
            color="blue"
            period={period}
          />
          <StatCard
            title="Tournament Fees"
            value={`₹${analytics.revenue.tournamentFees.toLocaleString()}`}
            icon="🎮"
            color="purple"
            period={period}
          />
          <StatCard
            title="Withdrawals"
            value={`₹${analytics.revenue.totalWithdrawals.toLocaleString()}`}
            subtitle={`${analytics.revenue.withdrawalCount} transactions`}
            icon="⬇️"
            color="orange"
            period={period}
          />
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={analytics.users.total.toLocaleString()}
            icon="👥"
            color="blue"
            period={period}
          />
          <StatCard
            title="Active Users"
            value={analytics.users.active.toLocaleString()}
            icon="✅"
            color="green"
            period={period}
          />
          <StatCard
            title="New Users"
            value={analytics.users.new.toLocaleString()}
            icon="🆕"
            color="cyan"
            period={period}
          />
          <StatCard
            title="KYC Pending"
            value={analytics.users.kycPending.toLocaleString()}
            icon="📋"
            color="yellow"
            period={period}
          />
        </div>

        {/* Tournament Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tournaments"
            value={analytics.tournaments.total.toLocaleString()}
            icon="🏆"
            color="purple"
            period={period}
          />
          <StatCard
            title="Live Tournaments"
            value={analytics.tournaments.live.toLocaleString()}
            icon="🔴"
            color="red"
            period={period}
          />
          <StatCard
            title="Completed"
            value={analytics.tournaments.completed.toLocaleString()}
            icon="✓"
            color="green"
            period={period}
          />
          <StatCard
            title="Registrations"
            value={analytics.tournaments.registrations.toLocaleString()}
            icon="📝"
            color="blue"
            period={period}
          />
        </div>

        {/* Revenue by Game */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Revenue by Game</h2>
          <div className="space-y-3">
            {Object.entries(analytics.gameRevenue).map(([game, revenue]) => (
              <div key={game} className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">{game}</span>
                <span className="text-green-600 font-bold">₹{revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {analytics.pendingDisputes > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-yellow-800">
                  {analytics.pendingDisputes} Pending Dispute{analytics.pendingDisputes > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-yellow-700">
                  Review required in disputes section
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  period,
}: {
  title: string
  value: string
  subtitle?: string
  icon: string
  color: string
  period: string
}) {
  const colorClasses: Record<string, string> = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
    cyan: 'from-cyan-500 to-blue-600',
    yellow: 'from-yellow-500 to-orange-600',
    red: 'from-red-500 to-pink-600',
  }

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        <div className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${colorClasses[color]} text-white font-bold`}>
          {period}
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-600 mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

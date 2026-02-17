'use client'

import { useEffect, useState } from 'react'
import {
  Users, Search, DollarSign, Shield, ShieldCheck, AlertTriangle,
  TrendingUp, Filter, MoreVertical, Eye, Ban, CheckCircle, XCircle,
  Calendar, Trophy, CreditCard
} from 'lucide-react'

interface User {
  id: string
  email: string
  username: string
  phone: string | null
  walletBalance: number
  role: string
  kycVerified: boolean
  isActive: boolean
  lastActive: string | null
  createdAt: string
  _count: {
    registrations: number
    transactions: number
    fines: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFineModal, setShowFineModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [fineData, setFineData] = useState({ amount: '', reason: '' })
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIssueFine = async () => {
    if (!selectedUser) return

    try {
      await fetch(`/api/admin/users/${selectedUser.id}/fine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fineData),
      })

      setShowFineModal(false)
      setFineData({ amount: '', reason: '' })
      fetchUsers()
      alert('Fine issued successfully')
    } catch (error) {
      alert('Failed to issue fine')
    }
  }

  const filteredUsers = users
    .filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter(user => {
      if (filter === 'verified') return user.kycVerified
      if (filter === 'pending') return !user.kycVerified
      return true
    })

  const stats = {
    total: users.length,
    verified: users.filter(u => u.kycVerified).length,
    pending: users.filter(u => !u.kycVerified).length,
    totalBalance: users.reduce((sum, u) => sum + Number(u.walletBalance), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-3xl blur-3xl -z-10"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Users Management</h1>
              <p className="text-slate-600 text-sm mt-0.5">Monitor and manage all platform users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users"
          value={stats.total.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard 
          title="KYC Verified"
          value={stats.verified.toLocaleString()}
          subtitle={`${((stats.verified/stats.total)*100).toFixed(1)}% verified`}
          icon={<ShieldCheck className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard 
          title="KYC Pending"
          value={stats.pending.toLocaleString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
          pulse={stats.pending > 0}
        />
        <StatCard 
          title="Total Balance"
          value={`₹${stats.totalBalance.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">User</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Wallet</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">KYC Status</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Activity</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Joined</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.username}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        {user._count.fines > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            {user._count.fines} fine{user._count.fines > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-600">₹{Number(user.walletBalance).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      user.kycVerified 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {user.kycVerified ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-slate-700">{user._count.registrations} tournaments</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-slate-600">{user._count.transactions} transactions</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowFineModal(true)
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
                    >
                      Issue Fine
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">No users found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Fine Modal */}
      {showFineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Issue Fine</h2>
                <p className="text-slate-600 text-sm">Penalize user: {selectedUser?.username}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fine Amount (₹)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={fineData.amount}
                    onChange={(e) => setFineData({ ...fineData, amount: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Fine
                </label>
                <textarea
                  value={fineData.reason}
                  onChange={(e) => setFineData({ ...fineData, reason: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                  rows={4}
                  placeholder="Using cheats in tournament, toxic behavior, etc..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowFineModal(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueFine}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-500/30"
              >
                Issue Fine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  pulse
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  gradient: string
  pulse?: boolean
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${pulse ? 'animate-pulse' : ''}`}>
            {icon}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

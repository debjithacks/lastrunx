'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Mail, Smartphone, ArrowLeft, LogOut, Wallet, ShieldCheck, Gamepad2, Trophy, BarChart2, Settings, AlertTriangle, CheckCircle, Bell } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  username: string
  phone: string | null
  phoneVerified: boolean
  walletBalance: string
  role: string
  kycVerified: boolean
  createdAt: string
  gameProfiles: Array<{
    id: string
    gameName: string
    inGameId: string
    inGameUsername: string
    verified: boolean
  }>
  _count: {
    registrations: number
    transactions: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      setError(null)
      console.log('Fetching profile... Session:', session)
      
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      console.log('Profile API Response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        data 
      })

      if (response.ok && data.user) {
        setProfile(data.user)
      } else {
        const errorMessage = data.error || 'Failed to load profile'
        console.error('Failed to fetch profile:', data)
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Profile not found</h2>
          {error && (
            <p className="text-slate-600 mb-4">{error}</p>
          )}
          <p className="text-sm text-slate-500 mb-6">
            Your session may be outdated or your account may have been removed. Please sign out and log in again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              Sign Out & Login Again
            </button>
            <Link 
              href="/" 
              className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 group transition-colors">
            <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm">Back to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-slate-400 border border-slate-200">
                {(profile.username || profile.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {profile.username || 'User'}
                </h1>
                <p className="text-slate-500 text-sm mb-3 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </p>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${profile.kycVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                    {profile.kycVerified ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {profile.kycVerified ? 'KYC Verified' : 'KYC Pending'}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${profile.phoneVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                    {profile.phoneVerified ? <Smartphone className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {profile.phoneVerified ? 'Phone Linked' : 'Phone Unlinked'}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto p-5 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-xl text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Wallet className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-8 mb-2">
                  <p className="text-slate-300 text-xs font-medium uppercase tracking-wider">Wallet Balance</p>
                  <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-6">
                  <p className="text-3xl font-bold tracking-tight">
                    ₹{parseFloat(profile.walletBalance).toFixed(2)}
                  </p>
                  <Link
                    href="/wallet"
                    className="px-4 py-2 bg-white text-indigo-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    Add Money
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                Account Details
              </h2>
              <Link href="/settings" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <span className="text-sm text-slate-500 font-medium">User ID</span>
                <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                  {profile.id ? `${profile.id.slice(0, 8)}...` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <span className="text-sm text-slate-500 font-medium">Email</span>
                <span className="text-sm font-medium text-slate-900">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <span className="text-sm text-slate-500 font-medium">Phone</span>
                <span className="text-sm font-medium text-slate-900">{profile.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <span className="text-sm text-slate-500 font-medium">Member Since</span>
                <span className="text-sm font-medium text-slate-900">
                  {new Date(profile.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <BarChart2 className="w-5 h-5" />
              </div>
              Activity Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-orange-600">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Tournaments</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">{profile._count?.registrations || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{profile._count?.transactions || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 hover:border-purple-200 transition-colors col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Gamepad2 className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Connected Games</span>
                  </div>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded text-purple-600 border border-purple-100">
                    {profile.gameProfiles?.length || 0} Linked
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.gameProfiles?.length > 0 ? (
                    profile.gameProfiles.slice(0, 3).map((game, i) => (
                      <span key={i} className="text-xs font-medium text-purple-800 bg-white/50 px-2 py-1 rounded border border-purple-100">
                        {game.gameName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-purple-400 italic">No games connected yet</span>
                  )}
                  {(profile.gameProfiles?.length || 0) > 3 && (
                    <span className="text-xs font-medium text-purple-800 bg-white/50 px-2 py-1 rounded border border-purple-100">
                      +{(profile.gameProfiles?.length || 0) - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-1">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/tournaments"
              className="group p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors">Tournaments</span>
            </Link>

            <Link
              href="/wallet"
              className="group p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-700 text-sm group-hover:text-emerald-700 transition-colors">My Wallet</span>
            </Link>

            <Link
              href="/notifications"
              className="group p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-700 text-sm group-hover:text-amber-700 transition-colors">Notifications</span>
            </Link>

            <Link
              href="/settings"
              className="group p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 rounded-full bg-slate-50 text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

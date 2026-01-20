'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      
      if (response.ok) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-semibold">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
            <span>←</span> Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl text-white font-black">
                {(profile.username || profile.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 mb-1">
                  {profile.username || 'User'}
                </h1>
                <p className="text-slate-600 mb-2">{profile.email}</p>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    profile.kycVerified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile.kycVerified ? '✓ KYC Verified' : '⚠ KYC Pending'}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    profile.phoneVerified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile.phoneVerified ? '✓ Phone Verified' : '⚠ Phone Unverified'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Wallet Balance</p>
              <p className="text-3xl font-black text-green-600">
                ₹{parseFloat(profile.walletBalance).toFixed(2)}
              </p>
              <Link 
                href="/wallet" 
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-block"
              >
                Add Money →
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-black text-slate-800 mb-4">Account Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">User ID</p>
                <p className="font-mono text-sm bg-slate-100 px-3 py-2 rounded-lg">
                  {profile.id ? `${profile.id.slice(0, 8)}...` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <p className="font-semibold text-slate-800">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Phone Number</p>
                <p className="font-semibold text-slate-800">
                  {profile.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Role</p>
                <p className="font-semibold text-slate-800">{profile.role}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Member Since</p>
                <p className="font-semibold text-slate-800">
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-black text-slate-800 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Tournaments Played</p>
                  <p className="text-3xl font-black text-blue-600">
                    {profile._count.registrations}
                  </p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Transactions</p>
                  <p className="text-3xl font-black text-green-600">
                    {profile._count.transactions}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Game Profiles</p>
                  <p className="text-3xl font-black text-purple-600">
                    {profile.gameProfiles.length}
                  </p>
                </div>
                <div className="text-4xl">🎮</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Profiles */}
        {profile.gameProfiles.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20 mt-6">
            <h2 className="text-2xl font-black text-slate-800 mb-4">Game Profiles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.gameProfiles.map((gameProfile) => (
                <div key={gameProfile.id} className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{gameProfile.gameName}</h3>
                    {gameProfile.verified && (
                      <span className="text-green-600 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="font-semibold">In-Game ID:</span> {gameProfile.inGameId}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Username:</span> {gameProfile.inGameUsername}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20 mt-6">
          <h2 className="text-2xl font-black text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/tournaments"
              className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition"
            >
              <div className="text-3xl mb-2">🏆</div>
              <p className="font-bold text-sm">Tournaments</p>
            </Link>
            <Link
              href="/wallet"
              className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition"
            >
              <div className="text-3xl mb-2">💰</div>
              <p className="font-bold text-sm">Wallet</p>
            </Link>
            <Link
              href="/user/stats"
              className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="font-bold text-sm">My Stats</p>
            </Link>
            <Link
              href="/settings"
              className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <p className="font-bold text-sm">Settings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

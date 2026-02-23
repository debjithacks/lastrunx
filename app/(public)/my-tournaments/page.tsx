'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Trophy, Users, Clock, Gamepad2, Calendar, MapPin, 
  ArrowLeft, CheckCircle, Loader2 
} from 'lucide-react'

interface Registration {
  id: string
  tournament: {
    id: string
    title: string
    game: string
    image: string
    entryFee: number
    prizePool: number
    maxPlayers: number
    startTime: string
    status: string
    mode: string
  }
  paymentStatus: string
  createdAt: string
}

export default function MyTournamentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchMyTournaments()
    }
  }, [status, router])

  const fetchMyTournaments = async () => {
    try {
      const res = await fetch('/api/user/tournaments')
      const data = await res.json()
      
      if (res.ok && data.registrations) {
        setRegistrations(data.registrations)
      } else {
        console.error('Failed to fetch tournaments:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatStartTime = (startTime: string) => {
    const date = new Date(startTime)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      return 'Starting soon'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your tournaments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/tournaments" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tournaments</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Tournaments</h1>
          <p className="text-slate-600">
            View and manage your registered tournaments
          </p>
        </div>

        {/* Registrations Grid */}
        {registrations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Tournaments Yet</h3>
            <p className="text-slate-600 mb-6">You haven't registered for any tournaments yet.</p>
            <Link href="/tournaments">
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                Browse Tournaments
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-indigo-100"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={registration.tournament.image || '/images/games/bgmi.avif'}
                    alt={registration.tournament.game}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      REGISTERED
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                      <Gamepad2 className="w-4 h-4" />
                      {registration.tournament.game}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {registration.tournament.title}
                  </h3>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Prize Pool
                      </span>
                      <span className="font-bold text-emerald-600">₹{registration.tournament.prizePool}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Starts
                      </span>
                      <span className="font-semibold text-indigo-600">
                        {formatStartTime(registration.tournament.startTime)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Registered
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatDate(registration.createdAt)}
                      </span>
                    </div>
                  </div>

                  <Link href={`/tournaments/${registration.tournament.id}`}>
                    <button className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all duration-300">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

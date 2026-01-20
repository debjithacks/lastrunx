'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

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
      // Handle both array and object response formats
      setTournaments(Array.isArray(data) ? data : data.tournaments || [])
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
      setTournaments([])
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Tournaments</h1>
            <p className="text-slate-600 mt-1">Manage all tournaments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Tournament</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Game</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Entry Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Prize Pool</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Players</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Start Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tournaments.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{tournament.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{tournament.gameType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">₹{tournament.entryFee}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">₹{tournament.prizePool}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {tournament._count.registrations}/{tournament.maxPlayers}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {new Date(tournament.startTime).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tournament.status === 'LIVE'
                            ? 'bg-red-100 text-red-700'
                            : tournament.status === 'UPCOMING'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tournament.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tournaments.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No tournaments found
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

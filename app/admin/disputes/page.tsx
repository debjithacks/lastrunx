'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

interface Dispute {
  id: string
  userId: string
  justification: string
  evidence?: string
  status: string
  createdAt: Date
  reviewedAt?: Date
  reviewNotes?: string
  fine: {
    id: string
    amount: number
    reason: string
  }
  user: {
    username: string
    email: string
  }
}

export default function DisputesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchDisputes()
    }
  }, [status, filter])

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/disputes?status=${filter}`)
      const data = await res.json()
      setDisputes(data)
    } catch (error) {
      console.error('Failed to fetch disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (disputeId: string, decision: 'APPROVED' | 'REJECTED') => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision, reviewNotes }),
      })

      if (res.ok) {
        setSelectedDispute(null)
        setReviewNotes('')
        fetchDisputes()
      }
    } catch (error) {
      console.error('Failed to review dispute:', error)
    } finally {
      setProcessing(false)
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
            <h1 className="text-3xl font-black text-slate-800">Disputes</h1>
            <p className="text-slate-600 mt-1">Review fine disputes</p>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="grid gap-6">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{dispute.user.username}</h3>
                  <p className="text-sm text-slate-600">{dispute.user.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    dispute.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : dispute.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {dispute.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Fine Amount</p>
                  <p className="text-lg font-bold text-red-600">₹{dispute.fine.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Fine Reason</p>
                  <p className="text-slate-800">{dispute.fine.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Dispute Justification</p>
                  <p className="text-slate-800">{dispute.justification}</p>
                </div>
                {dispute.evidence && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Evidence</p>
                    <a href={dispute.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      View Evidence
                    </a>
                  </div>
                )}
                {dispute.reviewNotes && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Review Notes</p>
                    <p className="text-slate-800">{dispute.reviewNotes}</p>
                  </div>
                )}
              </div>

              {dispute.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedDispute(dispute)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          ))}

          {disputes.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border-2 border-slate-200">
              No {filter.toLowerCase()} disputes
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Review Dispute</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Add your review notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(selectedDispute.id, 'APPROVED')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  Approve & Refund
                </button>
                <button
                  onClick={() => handleReview(selectedDispute.id, 'REJECTED')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedDispute(null)
                    setReviewNotes('')
                  }}
                  className="px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  AlertTriangle, FileText, CheckCircle, XCircle, 
  Clock, User, DollarSign, MessageSquare, ExternalLink 
} from 'lucide-react'

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

  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'PENDING').length,
    approved: disputes.filter(d => d.status === 'APPROVED').length,
    rejected: disputes.filter(d => d.status === 'REJECTED').length,
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-rose-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Disputes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-red-500/10 to-pink-500/10 rounded-3xl blur-3xl -z-10"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Disputes</h1>
              <p className="text-slate-600 text-sm mt-0.5">Review and resolve fine disputes</p>
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all font-semibold"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total" value={stats.total.toString()} gradient="from-slate-500 to-slate-700" />
        <StatCard title="Pending" value={stats.pending.toString()} gradient="from-amber-500 to-orange-600" pulse={stats.pending > 0} />
        <StatCard title="Approved" value={stats.approved.toString()} gradient="from-emerald-500 to-teal-600" />
        <StatCard title="Rejected" value={stats.rejected.toString()} gradient="from-rose-500 to-red-600" />
      </div>

      {/* Disputes Grid */}
      <div className="grid gap-6">
        {disputes.map((dispute) => (
          <DisputeCard 
            key={dispute.id}
            dispute={dispute}
            onReview={() => {
              setSelectedDispute(dispute)
              setReviewNotes('')
            }}
          />
        ))}
      </div>

      {disputes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <AlertTriangle className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold text-lg">No {filter.toLowerCase()} disputes</p>
        </div>
      )}

      {/* Review Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Review Dispute</h3>
                <p className="text-slate-600 text-sm">Make a decision on this case</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Review Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                rows={4}
                placeholder="Add your review notes..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReview(selectedDispute.id, 'APPROVED')}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/30"
              >
                {processing ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReview(selectedDispute.id, 'REJECTED')}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-red-700 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/30"
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setSelectedDispute(null)
                  setReviewNotes('')
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DisputeCard({ dispute, onReview }: { dispute: Dispute, onReview: () => void }) {
  const statusConfig = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    REJECTED: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
  }
  
  const config = statusConfig[dispute.status as keyof typeof statusConfig]
  const StatusIcon = config.icon

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
            {dispute.user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{dispute.user.username}</h3>
            <p className="text-sm text-slate-600">{dispute.user.email}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text} font-bold text-xs`}>
          <StatusIcon className="w-3 h-3" />
          {dispute.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold">Fine Amount</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">₹{dispute.fine.amount}</p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Created</span>
          </div>
          <p className="text-sm font-bold text-slate-700">{new Date(dispute.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-600 mb-1.5">Fine Reason</p>
          <p className="text-slate-900 text-sm">{dispute.fine.reason}</p>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-600 mb-1.5">Dispute Justification</p>
          <p className="text-slate-900 text-sm">{dispute.justification}</p>
        </div>

        {dispute.evidence && (
          <a 
            href={dispute.evidence} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Evidence
          </a>
        )}

        {dispute.reviewNotes && (
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-600 mb-1.5">Review Notes</p>
            <p className="text-slate-900 text-sm">{dispute.reviewNotes}</p>
          </div>
        )}
      </div>

      {dispute.status === 'PENDING' && (
        <button
          onClick={onReview}
          className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30"
        >
          Review Dispute
        </button>
      )}
    </div>
  )
}

function StatCard({ title, value, gradient, pulse }: { title: string, value: string, gradient: string, pulse?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all ${pulse ? 'animate-pulse' : ''}`}>
      <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
      <h3 className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</h3>
    </div>
  )
}

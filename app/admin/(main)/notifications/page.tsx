'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Send, Users, CheckCircle, MessageSquare, Plus } from 'lucide-react'
import ConfirmationModal from '@/components/ConfirmationModal'

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  category: string
  isActive: boolean
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'ALL_USERS',
    targetFilter: {},
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchTemplates()
    }
  }, [status])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications/templates')
      
      if (!res.ok) {
        console.error('API error:', res.status)
        setTemplates([])
        return
      }
      
      const data = await res.json()
      
      if (data.error) {
        console.error('API returned error:', data.error)
        setTemplates([])
        return
      }
      
      if (Array.isArray(data)) {
        setTemplates(data)
      } else {
        console.error('Invalid data format:', data)
        setTemplates([])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const result = await res.json()
        setConfirmModal({ isOpen: true, message: `Notification sent to ${result.totalSent} users`, type: 'success' })
        setShowSendModal(false)
        setFormData({
          title: '',
          message: '',
          targetType: 'ALL_USERS',
          targetFilter: {},
        })
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-cyan-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-600 text-sm mt-0.5">Send notifications to users</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSendModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
            <Send className="w-5 h-5" />
            Send Notification
          </button>
      </div>

      {/* Templates Grid */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-cyan-600" />
          <h2 className="text-xl font-bold text-slate-900">Templates</h2>
        </div>
        <div className="grid gap-4">
          {templates.map((template) => (
            <div key={template.id} className="group bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-cyan-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-cyan-600 transition-colors">{template.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{template.category}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    template.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {template.isActive ? (
                      <><CheckCircle className="w-3 h-3" /> Active</>
                    ) : (
                      'Inactive'
                    )}
                  </span>
                </div>
              </div>
              <p className="font-semibold text-slate-800 mb-2">{template.title}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{template.message}</p>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold">No templates found</p>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full my-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Send Notification</h3>
                <p className="text-slate-600 text-sm">Broadcast message to users</p>
              </div>
            </div>
            
            <form onSubmit={handleSendNotification} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                  placeholder="Important Update"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all resize-none"
                  rows={5}
                  placeholder="Your notification message..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Target Audience
                </label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                >
                  <option value="ALL_USERS">All Users</option>
                  <option value="ACTIVE_USERS">Active Users (Last 7 days)</option>
                  <option value="INACTIVE_USERS">Inactive Users (30+ days)</option>
                  <option value="GAME_SPECIFIC">Game Specific</option>
                  <option value="WALLET_BASED">Wallet Based</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Notification
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  )
}

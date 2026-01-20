'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

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
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
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
        alert(`Notification sent to ${result.totalSent} users`)
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
            <h1 className="text-3xl font-black text-slate-800">Notifications</h1>
            <p className="text-slate-600 mt-1">Send notifications to users</p>
          </div>
          
          <button
            onClick={() => setShowSendModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Send Notification
          </button>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Templates</h2>
          <div className="grid gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border-2 border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{template.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    template.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="font-semibold text-slate-700 mb-1">{template.title}</p>
                <p className="text-sm text-slate-600">{template.message}</p>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No templates found
              </div>
            )}
          </div>
        </div>

        {/* Send Notification Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Send Notification</h3>
              
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL_USERS">All Users</option>
                    <option value="ACTIVE_USERS">Active Users (Last 7 days)</option>
                    <option value="INACTIVE_USERS">Inactive Users (30+ days)</option>
                    <option value="GAME_SPECIFIC">Game Specific</option>
                    <option value="WALLET_BASED">Wallet Based</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Notification'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

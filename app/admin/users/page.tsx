'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

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

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Loading...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Users</h1>
            <p className="text-slate-600 mt-1">Manage platform users</p>
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none w-full max-w-md"
          />
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-bold text-slate-700">User</th>
                <th className="text-left px-6 py-4 font-bold text-slate-700">Wallet</th>
                <th className="text-left px-6 py-4 font-bold text-slate-700">KYC</th>
                <th className="text-left px-6 py-4 font-bold text-slate-700">Activity</th>
                <th className="text-left px-6 py-4 font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">{user.username}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      {user._count.fines > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          {user._count.fines} fines
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-green-600">₹{Number(user.walletBalance).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.kycVerified 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.kycVerified ? '✓ Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-slate-600">{user._count.registrations} tournaments</p>
                      <p className="text-slate-500">{user._count.transactions} transactions</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowFineModal(true)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition"
                    >
                      Issue Fine
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fine Modal */}
        {showFineModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-black text-slate-800 mb-4">
                Issue Fine to {selectedUser?.username}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={fineData.amount}
                    onChange={(e) => setFineData({ ...fineData, amount: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={fineData.reason}
                    onChange={(e) => setFineData({ ...fineData, reason: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Using cheats in tournament..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFineModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueFine}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Issue Fine
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

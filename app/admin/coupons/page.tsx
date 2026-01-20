'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface Coupon {
  id: string
  code: string
  type: string
  discountType: string
  discountValue: number
  scope: string
  gameType: string | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  validUntil: string
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'PROMOTIONAL',
    discountType: 'PERCENTAGE',
    discountValue: '',
    scope: 'PLATFORM_WIDE',
    gameType: '',
    usageLimit: '',
    validUntil: '',
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      setCoupons(data)
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      setShowCreateModal(false)
      setFormData({
        type: 'PROMOTIONAL',
        discountType: 'PERCENTAGE',
        discountValue: '',
        scope: 'PLATFORM_WIDE',
        gameType: '',
        usageLimit: '',
        validUntil: '',
      })
      fetchCoupons()
      alert('Coupon created successfully')
    } catch (error) {
      alert('Failed to create coupon')
    }
  }

  const toggleCoupon = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      fetchCoupons()
    } catch (error) {
      alert('Failed to update coupon')
    }
  }

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
            <h1 className="text-3xl font-black text-slate-800">Coupons</h1>
            <p className="text-slate-600 mt-1">Manage discount coupons</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            + Create Coupon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-white rounded-xl border-2 p-6 ${
                coupon.isActive ? 'border-green-200' : 'border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="font-mono text-2xl font-black text-blue-600">
                  {coupon.code}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  coupon.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount:</span>
                  <span className="font-bold text-slate-800">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Scope:</span>
                  <span className="font-bold text-slate-800">{coupon.scope}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Used:</span>
                  <span className="font-bold text-slate-800">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Expires:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleCoupon(coupon.id, coupon.isActive)}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  coupon.isActive
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {coupon.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full my-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6">
                Create New Coupon
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PROMOTIONAL">Promotional</option>
                    <option value="FIRST_TIME">First Time</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="SPECIAL_EVENT">Special Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="100 (leave empty for unlimited)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

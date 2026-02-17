'use client'

import { useEffect, useState } from 'react'
import { 
  Ticket, Tag, TrendingUp, Calendar, Users, DollarSign, 
  Percent, Plus, ChevronRight, Clock, CheckCircle, XCircle 
} from 'lucide-react'

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

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive).length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Coupons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl blur-3xl -z-10"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Coupons</h1>
              <p className="text-slate-600 text-sm mt-0.5">Manage discount coupons and promotions</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Coupons"
          value={stats.total.toString()}
          icon={<Ticket className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard 
          title="Active Coupons"
          value={stats.active.toString()}
          icon={<CheckCircle className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard 
          title="Total Usage"
          value={stats.totalUsage.toString()}
          icon={<Users className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-600"
        />
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <CouponCard 
            key={coupon.id}
            coupon={coupon}
            onToggle={toggleCoupon}
          />
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Ticket className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold text-lg">No coupons yet</p>
          <p className="text-sm text-slate-500 mt-2">Create your first coupon to get started</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full my-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Create New Coupon</h2>
                <p className="text-slate-600 text-sm">Add a new discount coupon</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CouponCard({ coupon, onToggle }: { coupon: Coupon, onToggle: (id: string, isActive: boolean) => void }) {
  const usagePercent = coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0
  const isExpired = new Date(coupon.validUntil) < new Date()
  
  return (
    <div className={`group relative bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 ${
      coupon.isActive ? 'border-emerald-200' : 'border-slate-200'
    }`}>
      {/* Top gradient bar */}
      <div className={`h-2 ${
        coupon.isActive 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
          : 'bg-gradient-to-r from-slate-400 to-slate-500'
      }`}></div>

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg mb-2">
              <Tag className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">{coupon.type}</span>
            </div>
            <div className="font-mono text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {coupon.code}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            coupon.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {coupon.isActive ? (
              <><CheckCircle className="w-3 h-3" /> Active</>
            ) : (
              <><XCircle className="w-3 h-3" /> Inactive</>
            )}
          </span>
        </div>

        {/* Discount Display */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center gap-2">
            {coupon.discountType === 'PERCENTAGE' ? (
              <>
                <Percent className="w-5 h-5 text-amber-600" />
                <span className="text-3xl font-bold text-amber-700">{coupon.discountValue}%</span>
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span className="text-3xl font-bold text-amber-700">₹{coupon.discountValue}</span>
              </>
            )}
          </div>
          <p className="text-center text-xs text-amber-600 font-semibold mt-1">OFF</p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Scope:</span>
            <span className="font-semibold text-slate-900">{coupon.scope}</span>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="text-slate-600">Usage:</span>
              <span className="font-semibold text-slate-900">
                {coupon.usedCount} / {coupon.usageLimit || '∞'}
              </span>
            </div>
            {coupon.usageLimit && (
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500"
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className={`w-4 h-4 ${isExpired ? 'text-rose-500' : 'text-slate-500'}`} />
            <span className={`font-medium ${isExpired ? 'text-rose-600' : 'text-slate-600'}`}>
              {isExpired ? 'Expired' : 'Expires'}: {new Date(coupon.validUntil).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onToggle(coupon.id, coupon.isActive)}
          className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
            coupon.isActive
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {coupon.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  gradient
}: {
  title: string
  value: string
  icon: React.ReactNode
  gradient: string
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-3`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  )
}

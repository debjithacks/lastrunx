'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ConfirmationModal from '@/components/ConfirmationModal'

interface Ad {
  id: string
  title: string
  mediaUrl: string
  mediaType: string
  placement: string
  redirectUrl: string
  priority: number
  isActive: boolean
  isHidden: boolean
  startDate: string
  expiryDate: string
  deviceTarget: string
  impressions: number
  clicks: number
  maxImpressions?: number
  createdAt: string
}


export default function AdsManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [placementFilter, setPlacementFilter] = useState('all')
  const [expiredFilter, setExpiredFilter] = useState('false')
  const [hiddenFilter, setHiddenFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })

  // Check if user is SuperAdmin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/admin/login')
      return
    }
    
    if (session.user.role !== 'SUPER_ADMIN') {
      router.push('/admin/dashboard')
      return
    }
  }, [session, status, router])

  // Fetch ads function with useCallback
  const fetchAds = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(placementFilter !== 'all' && { placement: placementFilter }),
        ...(expiredFilter === 'true' && { expired: 'true' }),
        ...(hiddenFilter !== 'all' && { hidden: hiddenFilter }),
        ...(searchQuery && { search: searchQuery }),
      })

      const res = await fetch(`/api/admin/ads?${params}`)
      
      if (!res.ok) {
        console.error('API error:', res.status)
        setAds([])
        return
      }
      
      const data = await res.json()

      if (data.error) {
        console.error('API returned error:', data.error)
        setAds([])
        return
      }

      if (res.ok && data.ads && Array.isArray(data.ads)) {
        setAds(data.ads)
        setTotalPages(data.totalPages || 1)
        setLastRefresh(new Date())
      } else {
        console.error('Invalid data format:', data)
        setAds([])
      }
    } catch (error) {
      console.error('Fetch ads error:', error)
      setAds([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [statusFilter, placementFilter, expiredFilter, hiddenFilter, searchQuery, currentPage])

  // Initial fetch and auto-refresh every 15 seconds for stats
  useEffect(() => {
    fetchAds()
    const interval = setInterval(() => fetchAds(false), 15000)
    return () => clearInterval(interval)
  }, [fetchAds])

  const toggleAdStatus = async (id: string) => {
    if (updatingIds.has(id)) return
    
    setUpdatingIds(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/admin/ads/${id}/toggle`, {
        method: 'PATCH',
      })

      if (res.ok) {
        await fetchAds(false)
      } else {
        const error = await res.json()
        setConfirmModal({ isOpen: true, message: error.error || 'Failed to update ad status', type: 'error' })
      }
    } catch (error) {
      console.error('Toggle ad error:', error)
      setConfirmModal({ isOpen: true, message: 'Failed to update ad status. Please try again.', type: 'error' })
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const toggleHideStatus = async (id: string) => {
    if (updatingIds.has(id)) return
    
    setUpdatingIds(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/admin/ads/${id}/hide`, {
        method: 'PATCH',
      })

      if (res.ok) {
        await fetchAds(false)
      } else {
        const error = await res.json()
        setConfirmModal({ isOpen: true, message: error.error || 'Failed to update ad visibility', type: 'error' })
      }
    } catch (error) {
      console.error('Toggle hide error:', error)
      setConfirmModal({ isOpen: true, message: 'Failed to update ad visibility. Please try again.', type: 'error' })
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const deleteAd = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        setDeleteModalId(null)
        fetchAds()
      } else {
        setConfirmModal({ isOpen: true, message: data.error || 'Failed to delete ad', type: 'error' })
      }
    } catch (error) {
      console.error('Delete ad error:', error)
      setConfirmModal({ isOpen: true, message: 'Failed to delete ad. Please try again.', type: 'error' })
    }
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const getClickRate = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  const getProgressPercentage = (impressions: number, maxImpressions?: number) => {
    if (!maxImpressions) return 0
    return Math.min((impressions / maxImpressions) * 100, 100)
  }

  const getPlacementColor = (placement: string) => {
    // Professional monochromatic design - all placements use same subtle style
    return 'bg-slate-100 text-slate-700 border border-slate-200'
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authorized
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ads Management</h1>
          <p className="text-slate-600 mt-1">Manage promotional ads across the platform</p>
          <p className="text-xs text-slate-400 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()} (auto-refresh every 15s)
          </p>
        </div>
        <Link
          href="/admin/ads/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Ad
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Placement Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Placement</label>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Placements</option>
              <option value="HOME_HERO">Home Hero</option>
              <option value="HOME_SIDEBAR">Home Sidebar</option>
              <option value="TOURNAMENT_TOP">Tournament Top</option>
              <option value="TOURNAMENT_SIDEBAR">Tournament Sidebar</option>
              <option value="BETWEEN_CONTENT">Between Content</option>
            </select>
          </div>

          {/* Hidden Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Visibility</label>
            <select
              value={hiddenFilter}
              onChange={(e) => setHiddenFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Ads</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={expiredFilter === 'true'}
              onChange={(e) => setExpiredFilter(e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Show expired only</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading ads...</p>
          </div>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No ads found</h3>
          <p className="text-slate-600 mb-6">Create your first ad to get started</p>
          <Link
            href="/admin/ads/new"
            className="inline-flex bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Ad
          </Link>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image/Video Preview */}
                <div className="relative h-48 bg-slate-50 rounded-t-lg overflow-hidden">
                  {ad.mediaType === 'VIDEO' ? (
                    <video
                      src={ad.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                    />
                  ) : (
                    <Image
                      src={ad.mediaUrl}
                      alt={ad.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isExpired(ad.expiryDate) && (
                      <span className="px-2.5 py-1 bg-white border border-red-200 text-red-700 text-xs font-medium rounded">
                        Expired
                      </span>
                    )}
                    {ad.isHidden && (
                      <span className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded">
                        Hidden
                      </span>
                    )}
                    {!ad.isActive && !ad.isHidden && (
                      <span className="px-2.5 py-1 bg-white border border-slate-300 text-slate-600 text-xs font-medium rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded ${getPlacementColor(ad.placement)}`}>
                      {ad.placement.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="font-bold text-lg text-slate-900 mb-2 truncate" title={ad.title}>
                    {ad.title}
                  </h3>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">
                        {ad.impressions.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Views</div>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <div className="text-2xl font-bold text-slate-900">
                        {ad.clicks.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">
                        {getClickRate(ad.impressions, ad.clicks)}%
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">CTR</div>
                    </div>
                  </div>

                  {/* Progress Bar (if max impressions set) */}
                  {ad.maxImpressions && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {ad.impressions.toLocaleString()} / {ad.maxImpressions.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(ad.impressions, ad.maxImpressions)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">Priority: {ad.priority}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md">{ad.deviceTarget}</span>
                  </div>

                  {/* Date Info */}
                  <div className="text-xs text-slate-500 space-y-1 mb-4 pb-4 border-b border-slate-200">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span className="font-medium">{new Date(ad.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiry:</span>
                      <span className={`font-medium ${isExpired(ad.expiryDate) ? 'text-red-600' : ''}`}>
                        {new Date(ad.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAdStatus(ad.id)}
                        disabled={updatingIds.has(ad.id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors border ${
                          ad.isActive
                            ? 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        } ${updatingIds.has(ad.id) ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {updatingIds.has(ad.id) ? (
                          <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Updating...</span>
                          </span>
                        ) : (
                          <span>{ad.isActive ? 'Active' : 'Inactive'}</span>
                        )}
                      </button>
                      <button
                        onClick={() => toggleHideStatus(ad.id)}
                        disabled={updatingIds.has(ad.id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors border ${
                          ad.isHidden
                            ? 'bg-slate-700 border-slate-700 text-white hover:bg-slate-800'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        } ${updatingIds.has(ad.id) ? 'opacity-50 cursor-wait' : ''}`}
                        title={ad.isHidden ? 'Click to show this ad' : 'Click to hide this ad'}
                      >
                        {updatingIds.has(ad.id) ? (
                          <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Updating...</span>
                          </span>
                        ) : (
                          <span>{ad.isHidden ? 'Hidden' : 'Hide'}</span>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/ads/edit/${ad.id}`}
                        className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteModalId(ad.id)}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <span className="px-6 py-2 bg-slate-100 text-slate-900 font-semibold rounded-lg border border-slate-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-3">Confirm Deletion</h3>
            <p className="text-center text-slate-600 mb-6">
              Are you sure you want to delete this ad? This action cannot be undone and will permanently remove all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAd(deleteModalId)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
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

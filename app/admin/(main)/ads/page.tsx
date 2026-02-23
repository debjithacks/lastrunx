'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Ad {
  id: string
  title: string
  mediaUrl: string
  mediaType: string
  placement: string
  redirectUrl: string
  priority: number
  isActive: boolean
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
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null)

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

  useEffect(() => {
    fetchAds()
  }, [statusFilter, placementFilter, expiredFilter, searchQuery, currentPage])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(placementFilter !== 'all' && { placement: placementFilter }),
        ...(expiredFilter === 'true' && { expired: 'true' }),
        ...(searchQuery && { search: searchQuery }),
      })

      const res = await fetch(`/api/admin/ads?${params}`)
      const data = await res.json()

      if (res.ok) {
        setAds(data.ads)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Fetch ads error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}/toggle`, {
        method: 'PATCH',
      })

      if (res.ok) {
        fetchAds()
      }
    } catch (error) {
      console.error('Toggle ad error:', error)
    }
  }

  const deleteAd = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeleteModalId(null)
        fetchAds()
      }
    } catch (error) {
      console.error('Delete ad error:', error)
    }
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ads Management</h1>
          <p className="text-gray-600 mt-1">Manage promotional ads across the platform</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Ad
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Placement</label>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Placements</option>
              <option value="HERO">Hero Section</option>
              <option value="BANNER">Banner</option>
              <option value="POPUP">Popup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expired</label>
            <select
              value={expiredFilter}
              onChange={(e) => setExpiredFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="false">Hide Expired</option>
              <option value="true">Show Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No ads found. Create your first ad to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preview</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Placement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Device</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stats</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dates</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ads.map((ad) => (
                  <tr key={ad.id} className={isExpired(ad.expiryDate) ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">
                      {ad.mediaType === 'IMAGE' ? (
                        <img
                          src={ad.mediaUrl}
                          alt={ad.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <video
                          src={ad.mediaUrl}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{ad.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {ad.redirectUrl}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {ad.placement}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{ad.priority}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{ad.deviceTarget}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>👁️ {ad.impressions.toLocaleString()}</div>
                        <div>🖱️ {ad.clicks.toLocaleString()}</div>
                        {ad.maxImpressions && (
                          <div className="text-xs text-gray-500">
                            Max: {ad.maxImpressions.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdStatus(ad.id)}
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          ad.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{new Date(ad.startDate).toLocaleDateString()}</div>
                        <div className={isExpired(ad.expiryDate) ? 'text-red-600 font-medium' : ''}>
                          {new Date(ad.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/ads/edit/${ad.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteModalId(ad.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ad? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAd(deleteModalId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

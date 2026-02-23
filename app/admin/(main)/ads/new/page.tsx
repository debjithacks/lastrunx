'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateAdPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    mediaUrl: '',
    mediaType: 'IMAGE',
    placement: 'HERO',
    redirectUrl: '',
    openInNewTab: true,
    priority: 1,
    deviceTarget: 'ALL',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    maxImpressions: '',
  })

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


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setError('Only image or video files are allowed')
      return
    }

    // Validate file size
    if (isImage && file.size > 300 * 1024) {
      setError('Image size must be less than 300KB (use WebP format)')
      return
    }

    if (isVideo && file.size > 2 * 1024 * 1024) {
      setError('Video size must be less than 2MB (use WebM format, max 10 seconds)')
      return
    }

    // Auto-detect media type
    const mediaType = isImage ? 'IMAGE' : 'VIDEO'
    setFormData((prev) => ({ ...prev, mediaType }))

    // Upload file
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('directory', 'ads')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (res.ok) {
        setFormData((prev) => ({ ...prev, mediaUrl: data.url }))
        setMediaPreview(data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        priority: parseInt(formData.priority as any),
        maxImpressions: formData.maxImpressions ? parseInt(formData.maxImpressions as any) : null,
      }

      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin/ads')
      } else {
        setError(data.error || 'Failed to create ad')
      }
    } catch (err) {
      setError('Failed to create ad. Please try again.')
    } finally {
      setLoading(false)
    }
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/ads" className="text-blue-600 hover:underline">
          ← Back to Ads
        </Link>
        <h1 className="text-3xl font-bold mt-2">Create New Ad</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Ad Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g., Summer Sale - Get 50% OFF"
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Media File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="w-full border rounded-lg px-3 py-2"
            required={!formData.mediaUrl}
          />
          <p className="text-sm text-gray-500 mt-1">
            Image: WebP format, max 300KB | Video: WebM format, max 1MB, 7 seconds
          </p>
          {mediaPreview && (
            <div className="mt-3">
              {formData.mediaType === 'IMAGE' ? (
                <img src={mediaPreview} alt="Preview" className="max-w-xs rounded-lg" />
              ) : (
                <video src={mediaPreview} controls className="max-w-xs rounded-lg" />
              )}
            </div>
          )}
        </div>

        {/* Placement */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Placement <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.placement}
            onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="HERO">Hero Section (Homepage Top)</option>
            <option value="BANNER">Banner (Between Content)</option>
            <option value="POPUP">Popup (Modal)</option>
          </select>
        </div>

        {/* Redirect URL */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Redirect URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            required
            value={formData.redirectUrl}
            onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="https://example.com/promo"
          />
          <div className="mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.openInNewTab}
                onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
              />
              <span className="text-sm">Open in new tab</span>
            </label>
          </div>
        </div>

        {/* Priority & Device Target */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">1-10 (Higher = More Important)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Device Target <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.deviceTarget}
              onChange={(e) => setFormData({ ...formData, deviceTarget: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="ALL">All Devices</option>
              <option value="MOBILE">Mobile Only</option>
              <option value="DESKTOP">Desktop Only</option>
            </select>
          </div>
        </div>

        {/* Start & Expiry Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Max Impressions */}
        <div>
          <label className="block text-sm font-medium mb-2">Max Impressions (Optional)</label>
          <input
            type="number"
            min="0"
            value={formData.maxImpressions}
            onChange={(e) => setFormData({ ...formData, maxImpressions: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Leave empty for unlimited"
          />
          <p className="text-sm text-gray-500 mt-1">
            Ad will auto-hide after reaching this limit
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            href="/admin/ads"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Ad'}
          </button>
        </div>
      </form>
    </div>
  )
}

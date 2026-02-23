'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Ad {
  id: string
  title: string
  mediaUrl: string
  mediaType: 'IMAGE' | 'VIDEO'
  redirectUrl: string
  openInNewTab?: boolean
}

interface AdCarouselProps {
  placement: 'HERO' | 'BANNER' | 'POPUP'
  autoSlide?: boolean
  interval?: number
  className?: string
}

export default function AdCarousel({
  placement,
  autoSlide = true,
  interval = 5000,
  className = '',
}: AdCarouselProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAds()
  }, [placement])

  const fetchAds = async () => {
    try {
      // Detect device type
      const device = window.innerWidth <= 768 ? 'MOBILE' : 'DESKTOP'
      
      const res = await fetch(`/api/ads?placement=${placement}&device=${device}`)
      const data = await res.json()

      if (res.ok && data.ads?.length > 0) {
        setAds(data.ads)
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackImpression = useCallback(async (adId: string) => {
    try {
      await fetch(`/api/admin/ads/${adId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'impression' }),
      })
    } catch (error) {
      console.error('Failed to track impression:', error)
    }
  }, [])

  const trackClick = async (adId: string) => {
    try {
      await fetch(`/api/admin/ads/${adId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' }),
      })
    } catch (error) {
      console.error('Failed to track click:', error)
    }
  }

  // Auto-slide effect
  useEffect(() => {
    if (!autoSlide || ads.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }, interval)

    return () => clearInterval(timer)
  }, [ads.length, autoSlide, interval])

  // Track impression when ad is shown
  useEffect(() => {
    if (ads[currentIndex]) {
      trackImpression(ads[currentIndex].id)
    }
  }, [currentIndex, ads, trackImpression])

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="w-full h-64" />
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

  const currentAd = ads[currentIndex]

  const handleAdClick = () => {
    trackClick(currentAd.id)
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Ad Content */}
      <Link
        href={currentAd.redirectUrl}
        target={currentAd.openInNewTab ? '_blank' : '_self'}
        rel={currentAd.openInNewTab ? 'noopener noreferrer' : ''}
        onClick={handleAdClick}
        className="block relative group"
      >
        {currentAd.mediaType === 'IMAGE' ? (
          <img
            src={currentAd.mediaUrl}
            alt={currentAd.title}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <video
            src={currentAd.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto object-cover"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>

      {/* Navigation Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {ads.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
            aria-label="Previous ad"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % ads.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
            aria-label="Next ad"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

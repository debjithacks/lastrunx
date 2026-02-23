'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  // Auto-slide effect (skip for videos - they advance on 'ended' event)
  useEffect(() => {
    if (!autoSlide || ads.length <= 1) return

    const currentAd = ads[currentIndex]
    
    // Don't auto-slide for videos - they handle their own progression
    if (currentAd?.mediaType === 'VIDEO') return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }, interval)

    return () => clearInterval(timer)
  }, [ads, currentIndex, autoSlide, interval])

  // Track impression when ad is shown
  useEffect(() => {
    if (ads[currentIndex]) {
      trackImpression(ads[currentIndex].id)
    }
  }, [currentIndex, ads, trackImpression])

  // Reset mute state when switching ads
  useEffect(() => {
    setIsMuted(true)
  }, [currentIndex])

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

  const handleVideoEnded = () => {
    // Auto-advance to next ad when video finishes
    if (autoSlide && ads.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMuted(!isMuted)
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
          <div className="relative">
            <video
              ref={videoRef}
              src={currentAd.mediaUrl}
              autoPlay
              muted={isMuted}
              playsInline
              className="w-full h-auto object-cover"
              preload="metadata"
              onEnded={handleVideoEnded}
            >
              Your browser does not support the video tag.
            </video>

            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200 z-20"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
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

'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    
    // GSAP Animations
    const ctx = gsap.context(() => {
      // Badge animation with elastic effect
      gsap.from(badgeRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.2
      })

      // Title animation with scale and power ease
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.4
      })

      // Subtitle fade up
      gsap.from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.6
      })

      // Staggered button animations
      gsap.from(buttonsRef.current?.children || [], {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
        stagger: 0.2,
        delay: 0.8
      })

      // Continuous floating animation for gaming elements
      gsap.utils.toArray('.gaming-float').forEach((element: any, i: number) => {
        gsap.to(element, {
          y: -20,
          rotation: 360,
          duration: 3 + (i % 3),
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.2
        })
      })

      // Gradient blobs pulsing
      gsap.to('.gradient-blob', {
        scale: 1.2,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 1,
          from: 'random'
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden mx-3 sm:mx-4 md:mx-6 lg:mx-8 mt-6 md:mt-8 mb-8 md:mb-12">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 animate-gradient-shift">
        {/* Gradient orbs for depth */}
        <div className="gradient-blob absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="gradient-blob absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="gradient-blob absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* Content */}
      <div className="relative z-10 text-center py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6">
        {/* Badge */}
        <div ref={badgeRef} className="inline-block mb-6 px-6 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-lg">
          <span className="text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2">
            <span className="inline-block animate-pulse">🏆</span>
            India's Premier Skill Gaming Platform
          </span>
        </div>

        {/* Main Title with Gradient */}
        <h1 ref={titleRef} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 sm:mb-8">
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
            LastRunx
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef} className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-700 font-semibold mb-10 sm:mb-12 md:mb-14 max-w-3xl mx-auto px-2">
          100% Skill-Based Mobile Gaming Tournaments
        </p>

        {/* CTA Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto px-4">
          <Link
            href="/tournaments"
            className="group relative bg-white px-8 py-4 rounded-2xl font-bold text-slate-800 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-blue-500"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">View Tournaments →</span>
          </Link>
          <Link
            href="/how-it-works"
            className="group bg-white/50 backdrop-blur-sm border-2 border-slate-300 px-8 py-4 rounded-2xl font-bold text-slate-700 text-base sm:text-lg hover:bg-white hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Floating Gaming Elements */}
      {/* Game Controllers */}
      <div className="gaming-float absolute top-20 left-10 text-4xl opacity-30">🎮</div>
      <div className="gaming-float absolute bottom-32 right-16 text-3xl opacity-25">🕹️</div>
      <div className="gaming-float absolute top-1/3 right-1/4 text-3xl opacity-20">🎮</div>
      
      {/* Gaming Accessories */}
      <div className="gaming-float absolute top-40 left-1/4 text-3xl opacity-30">🎧</div>
      <div className="gaming-float absolute bottom-48 right-32 text-3xl opacity-25">🎯</div>
      <div className="gaming-float absolute top-64 right-40 text-4xl opacity-20">🏆</div>
      
      {/* Gaming Elements */}
      <div className="gaming-float absolute top-96 left-20 text-2xl opacity-30">⚔️</div>
      <div className="gaming-float absolute bottom-20 left-1/3 text-3xl opacity-25">🎲</div>
      <div className="gaming-float absolute top-1/2 left-16 text-2xl opacity-20">🏅</div>
      
      {/* Geometric shapes with gaming colors */}
      <div className="gaming-float absolute top-32 right-1/3 w-12 h-12 border-4 border-blue-400/20 rounded-full"></div>
      <div className="gaming-float absolute bottom-40 left-1/2 w-10 h-10 bg-purple-400/15 rounded-lg rotate-45"></div>
      <div className="gaming-float absolute bottom-64 right-20 w-14 h-14 border-3 border-cyan-400/20 rotate-12"></div>
      
      {/* Additional gaming icons */}
      <div className="gaming-float absolute top-1/4 right-12 text-2xl opacity-25">👾</div>
      <div className="gaming-float absolute bottom-1/3 left-24 text-3xl opacity-30">🎖️</div>
    </section>
  )
}

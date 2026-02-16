'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Trophy, ShieldCheck, Zap, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Elegant fade-in for content
      gsap.from(contentRef.current?.children || [], {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 bg-white">
      {/* Clean Background with Subtle Accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-blue-50 to-transparent opacity-60 blur-3xl"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div ref={contentRef} className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 mx-auto">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">India's Premier Skill Gaming Platform</span>
          </div>

          {/* Main Display Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Turn Your <br className="hidden sm:block" />
            <span className="text-gradient-blue">Gaming Skills</span> into Cash
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of gamers competing in 100% legal, skill-based tournaments. Play BGMI, Free Fire Max, and more. Instant payouts, zero hassle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/tournaments"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-xl overflow-hidden transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1"
            >
              <span>Browse Tournaments</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/how-it-works"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* Trust Indicators - Card Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all group">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-lg mb-1">Daily Tournaments</p>
              <p className="text-sm text-slate-500">Compete 24/7 with real players</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all group">
              <div className="inline-flex p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-lg mb-1">100% Secure</p>
              <p className="text-sm text-slate-500">Legal & fully compliant</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all group">
              <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-lg mb-1">Instant Withdrawal</p>
              <p className="text-sm text-slate-500">Direct to your bank</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

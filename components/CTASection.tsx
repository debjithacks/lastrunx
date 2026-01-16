'use client'

import Image from 'next/image'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-12 md:mb-20">
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&h=800&fit=crop&q=90"
            alt="Gaming tournament background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/85 to-cyan-900/90" />
        </div>

        <div className="relative z-10 text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
            Ready to Test Your Skills?
          </h2>
          <p className="text-white mb-6 sm:mb-8 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Join skill-based tournaments in a legally compliant environment!
          </p>
          <Link
            href="/tournaments"
            className="inline-block bg-white border-2 border-slate-300 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-slate-800 hover:bg-blue-500 hover:border-blue-500 hover:text-white hover:shadow-2xl hover:shadow-blue-500/50"
          >
            View Tournaments →
          </Link>
        </div>
      </div>
    </section>
  )
}

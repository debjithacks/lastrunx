'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500 blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-600 blur-3xl opacity-30"></div>

          <div className="relative z-10 text-center py-16 px-8 md:px-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Turn Your Skills into Cash?
            </h2>
            <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
              Join thousands of players in India's most secure and professional gaming tournaments. Instant payouts, fair play guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tournaments"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <span>Browse Tournaments</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white border-2 border-blue-400 rounded-xl font-bold hover:bg-blue-600 transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

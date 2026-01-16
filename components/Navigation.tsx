'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center group">
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-700 via-slate-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
                LAST
              </span>
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent tracking-tight ml-0.5 group-hover:scale-110 transition-transform duration-300">
                RUN
              </span>
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent italic tracking-tight transform -skew-x-12 ml-0.5">
                X
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/" className="text-slate-900 hover:text-blue-600 transition font-medium text-sm lg:text-base">
              Home
            </Link>
            <Link href="/tournaments" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm lg:text-base">
              Tournaments
            </Link>
            <Link href="/legality" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm lg:text-base">
              Legal
            </Link>
            <Link href="/how-it-works" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm lg:text-base">
              How It Works
            </Link>
            <Link href="/rules" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm lg:text-base">
              Rules
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm lg:text-base">
              Contact
            </Link>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-3 ml-4">
              <Link
                href="/login"
                className="px-4 lg:px-5 py-2 rounded-xl font-bold text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all duration-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 lg:px-5 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-xl sm:text-2xl p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in border-t border-gray-200 mt-2 pt-4">
            <Link href="/" className="block py-2 text-slate-900 hover:text-blue-600 transition" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/tournaments" className="block py-2 text-slate-600 hover:text-blue-600 transition" onClick={() => setMobileMenuOpen(false)}>Tournaments</Link>
            <Link href="/legality" className="block py-2 text-slate-600 hover:text-blue-600 transition" onClick={() => setMobileMenuOpen(false)}>Legal Info</Link>
            <Link href="/how-it-works" className="block py-2 text-slate-600 hover:text-blue-600 transition" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="/rules" className="block py-2 text-slate-600 hover:text-blue-600 transition" onClick={() => setMobileMenuOpen(false)}>Rules</Link>
            <Link href="/contact" className="block py-2 text-slate-600 hover:text-blue-600 transition" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              <Link
                href="/login"
                className="block text-center py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block text-center py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

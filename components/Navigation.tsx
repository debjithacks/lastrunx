'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  Menu,
  X,
  User,
  Wallet,
  BarChart2,
  Settings,
  Shield,
  Phone,
  HelpCircle,
  Trophy,
  LogOut,
  ChevronDown,
  Gamepad2
} from 'lucide-react'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileMenuOpen])

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-1.5 rounded-lg group-hover:shadow-lg transition-all">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              LastRunX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" icon={<Gamepad2 className="w-4 h-4" />} text="Home" />
            <NavLink href="/tournaments" icon={<Trophy className="w-4 h-4" />} text="Tournaments" />

            <div className="h-4 w-px bg-slate-200 mx-2"></div>

            <NavLink href="/how-it-works" icon={<HelpCircle className="w-4 h-4" />} text="How it Works" />
            <NavLink href="/rules" icon={<Shield className="w-4 h-4" />} text="Rules" />
            <NavLink href="/contact" icon={<Phone className="w-4 h-4" />} text="Contact" />

            {/* Auth Sections */}
            <div className="ml-4 pl-4 border-l border-slate-200">
              {status === 'loading' ? (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : session ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className="flex flex-col items-end mr-1">
                      <span className="text-xs font-medium text-slate-500">Balance</span>
                      <span className="text-sm font-bold text-slate-900">₹{parseFloat(session.user.walletBalance || '0').toFixed(2)}</span>
                    </div>
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200">
                      {session.user.username?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in overflow-hidden ring-1 ring-black/5">
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-medium text-slate-900 truncate">{session.user.username}</p>
                        <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                      </div>

                      <div className="py-1">
                        <DropdownLink href="/profile" icon={<User className="w-4 h-4" />} text="My Profile" onClick={() => setProfileMenuOpen(false)} />
                        <DropdownLink href="/wallet" icon={<Wallet className="w-4 h-4" />} text="Wallet" onClick={() => setProfileMenuOpen(false)} />
                        <DropdownLink href="/user/stats" icon={<BarChart2 className="w-4 h-4" />} text="My Stats" onClick={() => setProfileMenuOpen(false)} />
                        <DropdownLink href="/settings" icon={<Settings className="w-4 h-4" />} text="Settings" onClick={() => setProfileMenuOpen(false)} />
                      </div>

                      <div className="py-1 border-t border-slate-50">
                        <button 
                          onClick={() => {
                            setProfileMenuOpen(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg font-medium text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in space-y-1">
            <MobileNavLink href="/" icon={<Gamepad2 className="w-4 h-4" />} text="Home" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/tournaments" icon={<Trophy className="w-4 h-4" />} text="Tournaments" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/how-it-works" icon={<HelpCircle className="w-4 h-4" />} text="How It Works" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/legal" icon={<Shield className="w-4 h-4" />} text="Legal" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/contact" icon={<Phone className="w-4 h-4" />} text="Contact" onClick={() => setMobileMenuOpen(false)} />

            <div className="pt-4 mt-4 border-t border-slate-100">
              {status === 'loading' ? (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : session ? (
                <div className="space-y-2 px-2">
                  <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg mb-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                      {session.user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{session.user.username}</p>
                      <p className="text-xs text-slate-500">₹{parseFloat(session.user.walletBalance || '0').toFixed(2)}</p>
                    </div>
                  </div>
                  <MobileNavLink href="/profile" icon={<User className="w-4 h-4" />} text="My Profile" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink href="/wallet" icon={<Wallet className="w-4 h-4" />} text="Wallet" onClick={() => setMobileMenuOpen(false)} />
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-2">
                  <Link
                    href="/login"
                    className="flex justify-center items-center py-2.5 rounded-lg font-medium text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex justify-center items-center py-2.5 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
    >
      {icon}
      <span>{text}</span>
    </Link>
  )
}

function DropdownLink({ href, icon, text, onClick }: { href: string; icon: React.ReactNode; text: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      onClick={onClick}
    >
      <span className="text-slate-400 group-hover:text-blue-600">{icon}</span>
      {text}
    </Link>
  )
}

function MobileNavLink({ href, icon, text, onClick }: { href: string; icon: React.ReactNode; text: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
      onClick={onClick}
    >
      <span className="text-slate-400">{icon}</span>
      {text}
    </Link>
  )
}


'use client'

import Link from 'next/link'
import { Gamepad2, Twitter, Instagram, Disc as Discord, Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white mb-6 group">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">LastRunX</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              The professional standard for skill-based mobile gaming tournaments in India. Secure, legal, and fair.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Discord className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Send className="w-5 h-5" />} />
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-6">Platform</h3>
            <ul className="space-y-4 text-sm">
              <li><FooterLink href="/tournaments">Browse Tournaments</FooterLink></li>
              <li><FooterLink href="/how-it-works">How It Works</FooterLink></li>
              <li><FooterLink href="/features">Features</FooterLink></li>
              <li><FooterLink href="/pricing">Pricing & Fees</FooterLink></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-6">Legal & Support</h3>
            <ul className="space-y-4 text-sm">
              <li><FooterLink href="/legality">Legal Compliance</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/contact">Contact Support</FooterLink></li>
            </ul>
          </div>

          {/* Newsletter/Status */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-6">System Status</h3>
            <div className="flex items-center gap-3 text-sm mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-500 font-medium">All Systems Operational</span>
            </div>
            <p className="text-xs text-slate-500">
              Server Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} LastRunX. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all"
    >
      {icon}
    </a>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block text-slate-400 hover:text-blue-400 transition-colors"
    >
      {children}
    </Link>
  )
}

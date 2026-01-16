'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative bg-slate-900 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-1 mb-3 group">
              <span className="text-xl font-black bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent">LAST</span>
              <span className="text-xl font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">RUN</span>
              <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent italic -skew-x-12">X</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              India's premier skill-based gaming platform. 100% legal, 100% fair, 100% skill.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Legally Compliant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tournaments" className="text-slate-400 hover:text-blue-400 transition-colors">Tournaments</Link></li>
              <li><Link href="/how-it-works" className="text-slate-400 hover:text-blue-400 transition-colors">How It Works</Link></li>
              <li><Link href="/rules" className="text-slate-400 hover:text-blue-400 transition-colors">Rules</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legality" className="text-slate-400 hover:text-blue-400 transition-colors">Legal Info</Link></li>
              <li><Link href="/legality#compliance" className="text-slate-400 hover:text-blue-400 transition-colors">Compliance</Link></li>
              <li><Link href="/legality#skill" className="text-slate-400 hover:text-blue-400 transition-colors">Skill vs Chance</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-slate-400 hover:text-blue-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/contact#faq" className="text-slate-400 hover:text-blue-400 transition-colors">FAQ</Link></li>
              <li><a href="mailto:support@lastrunx.in" className="text-slate-400 hover:text-blue-400 transition-colors">Email</a></li>
            </ul>
          </div>

          {/* Community */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-3">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://discord.gg/lastrunx" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">Discord</a></li>
              <li><a href="https://t.me/lastrunx" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">Telegram</a></li>
              <li><a href="https://instagram.com/lastrunx.india" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800"></div>

        {/* Bottom Section */}
        <div className="text-center pt-6">
          <p className="text-slate-500 text-sm">
            &copy; 2026 LastRunx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

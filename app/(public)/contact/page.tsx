'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Send, Phone, MapPin, MessageCircle, HelpCircle, FileText, CreditCard, Gavel } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your message! Our team will get back to you within 24 hours.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen py-12 md:py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-6 text-indigo-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Have questions about tournaments, payments, or game rules? Our support team is here to help you 24/7.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="payment">Payment Issues</option>
                    <option value="tournament">Tournament Questions</option>
                    <option value="legal">Legal/Compliance</option>
                    <option value="feedback">Feedback</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Email Support</h3>
                  <p className="text-slate-500 text-sm mb-3">For general inquiries and support tickets</p>
                  <a href="mailto:support@lastrunx.in" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    support@lastrunx.in
                  </a>
                  <p className="text-xs text-slate-400 mt-2">Response time: &lt; 24 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <MessageCircle className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-300" />
                  Community Channels
                </h3>
                <div className="space-y-3">
                  <a
                    href="https://discord.gg/lastrunx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Discord Community</p>
                      <p className="text-xs text-indigo-200">Chat with players & mods</p>
                    </div>
                  </a>

                  <a
                    href="https://t.me/lastrunx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center">
                      <Send className="w-4 h-4 text-white -ml-0.5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Telegram Channel</p>
                      <p className="text-xs text-indigo-200">Official announcements</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Quick Help
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Account Verification
                  </h4>
                  <p className="text-xs text-slate-600">Upload a valid government ID in profile settings for instant verification.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    Withdrawals
                  </h4>
                  <p className="text-xs text-slate-600">Processed within 1-3 business days. UPI is typically instant.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-slate-500" />
                    Legality
                  </h4>
                  <p className="text-xs text-slate-600">Skill-based gaming is legal in most states. Check Legal page for details.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

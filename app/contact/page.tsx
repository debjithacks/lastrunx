'use client'

import { useState } from 'react'

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
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4 px-6 py-2 bg-slate-100 border border-slate-300 rounded-full">
            <span className="text-slate-700 font-semibold text-xs sm:text-sm">📞 Get in Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-gradient">
            Contact Us
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 font-medium">
            Have questions? We're here to help!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Contact Form */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
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
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition resize-none"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-800 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 mb-4">📧 Email Support</h3>
              <div className="text-slate-600">
                <a href="mailto:support@lastrunx.in" className="text-blue-600 hover:underline text-lg font-semibold">support@lastrunx.in</a>
                <p className="text-sm mt-2">We typically respond within 24 hours</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 mb-4">💬 Join Our Community</h3>
              <div className="space-y-3">
                <a 
                  href="https://discord.gg/lastrunx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-indigo-100 transition border border-indigo-200 hover:border-indigo-400"
                >
                  <div className="text-3xl">💬</div>
                  <div>
                    <p className="font-bold text-slate-800">Discord</p>
                    <p className="text-xs text-slate-600">Chat with players & get updates</p>
                  </div>
                </a>
                
                <a 
                  href="https://t.me/lastrunx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-blue-100 transition border border-blue-200 hover:border-blue-400"
                >
                  <div className="text-3xl">✈️</div>
                  <div>
                    <p className="font-bold text-slate-800">Telegram</p>
                    <p className="text-xs text-slate-600">Tournament announcements</p>
                  </div>
                </a>
                
                <a 
                  href="https://instagram.com/lastrunx.india" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-pink-100 transition border border-pink-200 hover:border-pink-400"
                >
                  <div className="text-3xl">📸</div>
                  <div>
                    <p className="font-bold text-slate-800">Instagram</p>
                    <p className="text-xs text-slate-600">Follow for highlights & updates</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-3">💬 Live Chat</h3>
              <p className="text-sm text-slate-600 mb-4">Get instant help from our support team</p>
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                Start Live Chat
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow">
              <h3 className="font-bold text-slate-800 mb-2">How do I verify my account?</h3>
              <p className="text-sm text-slate-600">Upload a valid government ID (Aadhaar, PAN, Passport, or Driving License) in your profile settings.</p>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow">
              <h3 className="font-bold text-slate-800 mb-2">How long do withdrawals take?</h3>
              <p className="text-sm text-slate-600">Withdrawals are processed within 1-3 business days. UPI transfers are typically instant.</p>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow">
              <h3 className="font-bold text-slate-800 mb-2">Is skill gaming legal in India?</h3>
              <p className="text-sm text-slate-600">Yes, skill-based gaming is legal in most Indian states. Check our Legal page for state-specific details.</p>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow">
              <h3 className="font-bold text-slate-800 mb-2">What if I face technical issues during a tournament?</h3>
              <p className="text-sm text-slate-600">Contact support immediately with screenshots/video proof. We'll investigate and provide appropriate resolution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

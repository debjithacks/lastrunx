'use client'

import { useState } from 'react'
import { Search, Bell, Menu, User, Settings, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

interface TopHeaderProps {
    onMenuClick: () => void
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
    const { data: session } = useSession()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    return (
        <header className="sticky top-0 z-30 lg:left-64 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden sm:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="p-2 relative text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        {/* Notifications Dropdown */}
                        {isNotificationsOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsNotificationsOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 py-2">
                                    <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                                        <span className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">Mark all read</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium">New User Registration</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">John Doe signed up via Email</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">2 mins ago</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                                                    <Bell className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium">New Dispute Raised</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Tournament #1234 reported</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">15 mins ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/50 text-center">
                                        <Link href="/admin/notifications" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All Notifications</Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1.5 pl-3 pr-2 rounded-xl text-left hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-slate-900 leading-none">
                                    {session?.user?.username || 'Admin User'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 leading-none">
                                    {session?.user?.email || 'admin@example.com'}
                                </p>
                            </div>
                            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
                                {session?.user?.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsProfileOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 py-1">
                                    <div className="px-4 py-3 border-b border-slate-50 sm:hidden">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {session?.user?.username || 'Admin User'}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {session?.user?.email || 'admin@example.com'}
                                        </p>
                                    </div>
                                    <Link
                                        href="/admin/profile"
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/admin/settings"
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                    <div className="border-t border-slate-50 mt-1">
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/admin/login' })}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

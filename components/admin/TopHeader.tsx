'use client'

import { useState, useEffect } from 'react'
import { FlaticonIcon } from '../FlaticonIcon'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface TopHeaderProps {
    onMenuClick: () => void
}

interface Notification {
    id: string
    type: string
    icon: string
    title: string
    message: string
    time: Date
    link?: string
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
    const { data: session } = useSession()
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    const getRoleDisplay = () => {
        switch (session?.user?.role) {
            case 'SUPER_ADMIN': return { label: 'Super Admin', color: 'bg-purple-50 border-purple-200 text-purple-700' }
            case 'ADMIN': return { label: 'Admin', color: 'bg-blue-50 border-blue-200 text-blue-700' }
            case 'TOURNAMENT_MANAGER': return { label: 'Manager', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
            case 'SUPPORT': return { label: 'Support', color: 'bg-amber-50 border-amber-200 text-amber-700' }
            case 'MARKETING': return { label: 'Marketing', color: 'bg-rose-50 border-rose-200 text-rose-700' }
            default: return { label: 'Staff', color: 'bg-slate-50 border-slate-200 text-slate-700' }
        }
    }

    useEffect(() => {
        setMounted(true)
        fetchNotifications()
        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/notifications/recent')
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const getIconColor = (type: string) => {
        switch (type) {
            case 'user_registration': return 'bg-blue-50 text-blue-600'
            case 'dispute': return 'bg-amber-50 text-amber-600'
            case 'kyc': return 'bg-purple-50 text-purple-600'
            case 'activity': return 'bg-slate-50 text-slate-600'
            default: return 'bg-gray-50 text-gray-600'
        }
    }

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
        return `${Math.floor(seconds / 86400)} days ago`
    }

    return (
        <header className="sticky top-0 z-30 lg:left-64 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                    >
                        <FlaticonIcon name="menu-burger" style="bold" className="text-xl" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden sm:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all"
                            />
                            <FlaticonIcon name="search" style="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsNotificationsOpen(!isNotificationsOpen)
                                if (!isNotificationsOpen) fetchNotifications()
                            }}
                            className="p-2 relative text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <FlaticonIcon name="bell" style="bold" className="text-lg" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
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
                                        <button 
                                            onClick={fetchNotifications}
                                            className="text-xs text-blue-600 font-medium hover:underline cursor-pointer disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            {loading ? 'Loading...' : 'Refresh'}
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <Link
                                                    key={notif.id}
                                                    href={notif.link || '#'}
                                                    onClick={() => setIsNotificationsOpen(false)}
                                                    className="block p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notif.type)}`}>
                                                            <FlaticonIcon name={notif.icon} style="bold" className="text-base" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-slate-800 font-medium truncate">{notif.title}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.message}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1">{getTimeAgo(notif.time)}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                    <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/50 text-center">
                                        <Link href="/admin/notifications" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All Notifications</Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Role Badge */}
                    {mounted && session?.user && (
                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getRoleDisplay().color} transition-all`}>
                            <FlaticonIcon name="shield-check" style="bold" className="text-sm" />
                            <span className="text-xs font-semibold whitespace-nowrap">{getRoleDisplay().label}</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

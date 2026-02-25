'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { FlaticonIcon } from '../FlaticonIcon'

interface SidebarProps {
    isOpen: boolean
    isCollapsed: boolean
    onClose: () => void
    onToggleCollapse: () => void
}

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [mounted, setMounted] = useState(false)
    const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

    useEffect(() => {
        setMounted(true)
    }, [])

    const getPanelType = () => {
        if (!mounted) return 'ADMIN PANEL'
        switch (session?.user?.role) {
            case 'SUPER_ADMIN': return 'SUPER ADMIN PANEL'
            case 'ADMIN': return 'ADMIN PANEL'
            case 'TOURNAMENT_MANAGER': return 'MANAGER PANEL'
            case 'SUPPORT': return 'SUPPORT PANEL'
            case 'MARKETING': return 'MARKETING PANEL'
            default: return 'ADMIN PANEL'
        }
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
        { name: 'Tournaments', href: '/admin/tournaments', icon: 'trophy' },
        { name: 'Users', href: '/admin/users', icon: 'users' },
        { name: 'Coupons', href: '/admin/coupons', icon: 'ticket' },
        { name: 'Disputes', href: '/admin/disputes', icon: 'scale' },
        { name: 'Notifications', href: '/admin/notifications', icon: 'bell' },
        { name: 'Activity Logs', href: '/admin/logs', icon: 'file-user' },
        { name: 'Settings', href: '/admin/settings', icon: 'settings' },
    ]

    // SuperAdmin-only navigation items
    const superAdminNavigation = [
        { name: 'Ads Management', href: '/admin/ads', icon: 'megaphone' },
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-xl shadow-slate-900/5 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isCollapsed ? 'w-20' : 'w-64'}`}>
                
                {/* Collapse/Expand Toggle Button - Desktop Only */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-full items-center justify-center shadow-lg shadow-slate-900/10 transition-all duration-300 hover:scale-110"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <FlaticonIcon 
                        name={isCollapsed ? 'angle-right' : 'angle-left'} 
                        style="bold" 
                        className="text-sm text-slate-700" 
                    />
                </button>

                {/* Header */}
                <div className={`p-5 border-b border-slate-200 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
                    <Link href="/admin/dashboard" className={`flex items-center gap-2.5 group ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors flex-shrink-0">
                            <FlaticonIcon name="shield-check" style="bold" className="text-lg text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden transition-all duration-300">
                                <h1 className="text-lg font-bold tracking-tight whitespace-nowrap text-slate-900">LASTRUNX</h1>
                                <p className="text-xs text-slate-500 font-semibold tracking-wider whitespace-nowrap">{getPanelType()}</p>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 lg:hidden transition-colors"
                    >
                        <FlaticonIcon name="cross" style="bold" className="text-lg" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto py-6 space-y-1 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <div key={item.name} className="relative group/item">
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 py-3 rounded-lg transition-colors group relative ${isCollapsed ? 'px-3 justify-center' : 'px-4'
                                    } ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <FlaticonIcon 
                                        name={item.icon} 
                                        style="bold" 
                                        className="text-lg"
                                    />
                                    {!isCollapsed && (
                                        <span className="font-semibold whitespace-nowrap overflow-hidden">{item.name}</span>
                                    )}
                                </Link>
                                
                                {/* Tooltip on hover when collapsed */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-xl shadow-slate-900/30 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                                        {item.name}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* SuperAdmin Only - Marketing Section */}
                    {isSuperAdmin && (
                        <>
                            {!isCollapsed && (
                                <div className="px-4 pt-6 pb-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marketing</h3>
                                </div>
                            )}
                            {superAdminNavigation.map((item) => {
                                const isActive = pathname.startsWith(item.href)
                                return (
                                    <div key={item.name} className="relative group/item">
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 py-3 rounded-lg transition-colors group relative ${isCollapsed ? 'px-3 justify-center' : 'px-4'
                                            } ${isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                            title={isCollapsed ? item.name : ''}
                                        >
                                            <FlaticonIcon 
                                                name={item.icon} 
                                                style="bold" 
                                                className="text-lg"
                                            />
                                            {!isCollapsed && (
                                                <span className="font-semibold whitespace-nowrap overflow-hidden">{item.name}</span>
                                            )}
                                        </Link>
                                        
                                        {/* Tooltip on hover when collapsed */}
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-xl shadow-slate-900/30 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                                                {item.name}
                                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </nav>

                {/* Footer */}
                <div className={`p-4 border-t border-slate-200 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
                    <button 
                        onClick={() => signOut({ callbackUrl: '/admin/login' })}
                        className={`w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors ${isCollapsed ? 'px-2' : 'px-4'}`}
                        title={isCollapsed ? 'Sign Out' : ''}
                    >
                        <FlaticonIcon name="sign-out-alt" style="bold" className="text-base" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </div>
        </>
    )
}

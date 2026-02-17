'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FlaticonIcon } from '../FlaticonIcon'

interface SidebarProps {
    isOpen: boolean
    isCollapsed: boolean
    onClose: () => void
    onToggleCollapse: () => void
}

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname()

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
                <div className={`p-5 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
                    <Link href="/admin/dashboard" className={`flex items-center gap-2.5 group ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-200 flex-shrink-0">
                            <FlaticonIcon name="shield-check" style="bold" className="text-lg text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden transition-all duration-300">
                                <h1 className="text-lg font-bold tracking-tight whitespace-nowrap bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">LASTRUNX</h1>
                                <p className="text-xs text-slate-500 font-semibold tracking-wider whitespace-nowrap">ADMIN PANEL</p>
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
                                    className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                                        isCollapsed ? 'px-3 justify-center' : 'px-4'
                                    } ${
                                        isActive
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                                            : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900'
                                    }`}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <FlaticonIcon 
                                        name={item.icon} 
                                        style="bold" 
                                        className={`text-lg transition-transform duration-200 ${
                                            isActive ? 'scale-110' : 'group-hover:scale-110'
                                        }`}
                                    />
                                    {!isCollapsed && (
                                        <span className="font-semibold whitespace-nowrap overflow-hidden">{item.name}</span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full" />
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
                </nav>

                {/* Footer */}
                <div className={`p-4 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
                    <div className={`bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'mb-2 flex-col' : 'mb-3'}`}>
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-300">
                                    <FlaticonIcon name="user" style="bold" className="text-lg text-slate-600" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-800 truncate">Administrator</p>
                                    <p className="text-xs text-slate-500 font-semibold truncate">Super Admin</p>
                                </div>
                            )}
                        </div>
                        <button 
                            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] group ${isCollapsed ? 'px-2' : 'px-4'}`}
                            title={isCollapsed ? 'Sign Out' : ''}
                        >
                            <FlaticonIcon name="sign-out-alt" style="bold" className="text-base group-hover:-translate-x-0.5 transition-transform" />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

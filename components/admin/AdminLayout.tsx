'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <TopHeader
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

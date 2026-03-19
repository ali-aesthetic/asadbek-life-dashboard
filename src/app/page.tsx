'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import dynamic from 'next/dynamic'
import { LayoutDashboard, BookOpen, GraduationCap, FolderKanban, ClipboardList } from 'lucide-react'

const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false })
const Books = dynamic(() => import('@/components/Books'), { ssr: false })
const Courses = dynamic(() => import('@/components/Courses'), { ssr: false })
const Projects = dynamic(() => import('@/components/Projects'), { ssr: false })
const WeeklyReview = dynamic(() => import('@/components/WeeklyReview'), { ssr: false })

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'review', label: 'Review', icon: ClipboardList },
]

const variants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const hydrate = useDashboardStore(s => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <div className="min-h-screen" style={{ background: '#1a1a2e' }}>
      {/* Header */}
      <header className="border-b border-[#ffffff10] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Asadbek&apos;s Dashboard</h1>
            <p className="text-gray-500 text-xs">Life management · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#a78bfa] flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-[#ffffff10] px-4 sticky top-0 z-40" style={{ background: '#1a1a2e' }}>
        <div className="max-w-3xl mx-auto flex overflow-x-auto gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-[#ff6b6b] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'books' && <Books />}
            {activeTab === 'courses' && <Courses />}
            {activeTab === 'projects' && <Projects />}
            {activeTab === 'review' && <WeeklyReview />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

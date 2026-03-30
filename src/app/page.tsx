'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import dynamic from 'next/dynamic'
import { LayoutDashboard, BookOpen, GraduationCap, FolderKanban, ClipboardList } from 'lucide-react'

const Dashboard  = dynamic(() => import('@/components/Dashboard'),    { ssr: false })
const Books      = dynamic(() => import('@/components/Books'),         { ssr: false })
const Courses    = dynamic(() => import('@/components/Courses'),       { ssr: false })
const Projects   = dynamic(() => import('@/components/Projects'),      { ssr: false })
const WeeklyReview = dynamic(() => import('@/components/WeeklyReview'), { ssr: false })

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'books',     label: 'Books',     icon: BookOpen },
  { id: 'courses',   label: 'Courses',   icon: GraduationCap },
  { id: 'projects',  label: 'Projects',  icon: FolderKanban },
  { id: 'review',    label: 'Review',    icon: ClipboardList },
]

const variants = {
  enter:  { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -10 },
}

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.ceil((days + start.getDay() + 1) / 7)
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const hydrate = useDashboardStore(s => s.hydrate)

  useEffect(() => { hydrate() }, [hydrate])

  const dayOfYear  = getDayOfYear()
  const weekNumber = getWeekNumber()
  const dateStr    = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 pt-5 pb-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1
              className="font-display text-2xl tracking-wide text-white leading-none"
              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif', letterSpacing: '0.06em' }}
            >
              Asadbek&apos;s Dashboard
            </h1>
            <p className="text-[#8181A0] text-xs mt-1">
              {dateStr}
              <span className="mx-2 opacity-40">·</span>
              Week {weekNumber}
              <span className="mx-2 opacity-40">·</span>
              Day {dayOfYear} of {new Date().getFullYear()}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF4757 0%, #8B70FA 100%)' }}
            aria-label="Profile avatar"
          >
            A
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav
        className="px-4 sticky top-0 z-40 border-b"
        style={{ background: 'rgba(9,9,15,0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-3xl mx-auto flex overflow-x-auto gap-0.5 py-2">
          {TABS.map(tab => {
            const Icon    = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[rgba(255,71,87,0.15)] text-[#FF4757]'
                    : 'text-[#8181A0] hover:text-[#ECEDF3] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'books'     && <Books />}
            {activeTab === 'courses'   && <Courses />}
            {activeTab === 'projects'  && <Projects />}
            {activeTab === 'review'    && <WeeklyReview />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

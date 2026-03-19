'use client'

import { useEffect, useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Dumbbell, BookOpen, UtensilsCrossed, Calendar, Plus } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const GYM_DAYS = ['monday', 'wednesday', 'friday', 'saturday']
const STUDY_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

interface Event {
  date: string
  title: string
  icon: string
}

const UPCOMING_EVENTS: Event[] = [
  { date: 'Mar 29', title: 'Tohir Sodikov Concert', icon: '🎵' },
  { date: 'Apr 1', title: 'Million Concert', icon: '🎶' },
]

export default function Dashboard() {
  const { currentWeekLog, logGym, logMood, addPages } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [moodInput, setMoodInput] = useState('')
  const [pagesInput, setPagesInput] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const gymCount = hydrated ? currentWeekLog.gymDays.length : 0
  const pagesRead = hydrated ? currentWeekLog.pagesRead : 0
  const avgMood = hydrated && currentWeekLog.moodEntries.length > 0
    ? (currentWeekLog.moodEntries.reduce((s, e) => s + e.value, 0) / currentWeekLog.moodEntries.length).toFixed(1)
    : '—'

  function handleLogGym(dayKey: string) {
    logGym(dayKey)
    show('Gym logged!')
  }

  function handleLogMood() {
    const v = parseInt(moodInput)
    if (isNaN(v) || v < 1 || v > 10) return
    logMood(v)
    setMoodInput('')
    show('Mood logged!')
  }

  function handleAddPages() {
    const v = parseInt(pagesInput)
    if (isNaN(v) || v <= 0) return
    addPages(v)
    setPagesInput('')
    show(`+${v} pages logged!`)
  }

  function getWeekDates(): string[] {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(diff + i)
      return d.getDate().toString()
    })
  }

  const weekDates = getWeekDates()
  const todayIndex = (() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })()

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={hide} />}

      {/* Weekly Calendar */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-[#a78bfa]" /> Weekly Schedule
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const dayKey = DAY_KEYS[i]
            const isGym = GYM_DAYS.includes(dayKey)
            const isStudy = STUDY_DAYS.includes(dayKey)
            const isMealPrep = dayKey === 'sunday'
            const isToday = i === todayIndex
            const gymLogged = hydrated && currentWeekLog.gymDays.includes(dayKey)

            return (
              <div
                key={day}
                className={`rounded-xl p-2 flex flex-col gap-1 min-h-[100px] border ${
                  isToday ? 'border-[#ff6b6b]' : 'border-[#ffffff15]'
                } bg-[#0f0f1a]`}
              >
                <div className={`text-center text-xs font-bold ${isToday ? 'text-[#ff6b6b]' : 'text-gray-400'}`}>
                  {day}
                </div>
                <div className="text-center text-xs text-gray-500">{weekDates[i]}</div>
                <div className="flex flex-col gap-1 mt-1">
                  {isGym && (
                    <button
                      onClick={() => handleLogGym(dayKey)}
                      className={`text-xs rounded-md px-1 py-0.5 transition-all ${
                        gymLogged
                          ? 'bg-[#ff6b6b] text-white'
                          : 'bg-[#ff6b6b20] text-[#ff6b6b] hover:bg-[#ff6b6b40]'
                      }`}
                    >
                      🏋️ {gymLogged ? '✓' : 'Gym'}
                    </button>
                  )}
                  {isStudy && (
                    <div className="text-xs rounded-md px-1 py-0.5 bg-[#a78bfa20] text-[#a78bfa]">
                      📚 Study
                    </div>
                  )}
                  {isMealPrep && (
                    <div className="text-xs rounded-md px-1 py-0.5 bg-[#51cf6620] text-[#51cf66]">
                      🍽️ Meal Prep
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-[#51cf66]" /> Quick Log
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Log Gym */}
          <div className="bg-[#0f0f1a] border border-[#ffffff15] rounded-xl p-3 space-y-2">
            <div className="text-sm font-medium text-[#ff6b6b] flex items-center gap-2">
              <Dumbbell size={14} /> Log Gym
            </div>
            <div className="flex flex-wrap gap-1">
              {GYM_DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => handleLogGym(d)}
                  className={`text-xs px-2 py-1 rounded-lg capitalize transition-all ${
                    hydrated && currentWeekLog.gymDays.includes(d)
                      ? 'bg-[#ff6b6b] text-white'
                      : 'bg-[#ff6b6b20] text-[#ff6b6b] hover:bg-[#ff6b6b40]'
                  }`}
                >
                  {d.slice(0, 3)} {hydrated && currentWeekLog.gymDays.includes(d) ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Log Mood */}
          <div className="bg-[#0f0f1a] border border-[#ffffff15] rounded-xl p-3 space-y-2">
            <div className="text-sm font-medium text-[#a78bfa] flex items-center gap-2">
              😊 Log Mood (1–10)
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={moodInput}
                onChange={e => setMoodInput(e.target.value)}
                placeholder="e.g. 8"
                className="flex-1 bg-[#1a1a2e] border border-[#ffffff20] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#a78bfa]"
              />
              <button
                onClick={handleLogMood}
                className="bg-[#a78bfa] text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-80 transition-opacity"
              >
                Log
              </button>
            </div>
          </div>

          {/* Log Pages */}
          <div className="bg-[#0f0f1a] border border-[#ffffff15] rounded-xl p-3 space-y-2">
            <div className="text-sm font-medium text-[#51cf66] flex items-center gap-2">
              <BookOpen size={14} /> Log Pages Read
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={pagesInput}
                onChange={e => setPagesInput(e.target.value)}
                placeholder="e.g. 20"
                className="flex-1 bg-[#1a1a2e] border border-[#ffffff20] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#51cf66]"
              />
              <button
                onClick={handleAddPages}
                className="bg-[#51cf66] text-black px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#ff6b6b]">{gymCount}<span className="text-base text-gray-400">/4</span></div>
          <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1"><Dumbbell size={12} /> Gym Sessions</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#51cf66]">{pagesRead}</div>
          <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1"><BookOpen size={12} /> Pages Read</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#a78bfa]">{avgMood}</div>
          <div className="text-xs text-gray-400 mt-1">😊 Mood Avg</div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          📌 Upcoming Events
        </h2>
        <div className="space-y-2">
          {UPCOMING_EVENTS.map(ev => (
            <div key={ev.title} className="flex items-center gap-3 bg-[#0f0f1a] border border-[#ffffff15] rounded-xl p-3">
              <span className="text-xl">{ev.icon}</span>
              <div>
                <div className="text-white font-medium text-sm">{ev.title}</div>
                <div className="text-gray-400 text-xs">{ev.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Prep Note */}
      <div className="card flex items-center gap-3">
        <UtensilsCrossed size={20} className="text-[#51cf66]" />
        <div>
          <div className="text-white font-medium text-sm">Meal Prep — Sunday</div>
          <div className="text-gray-400 text-xs">Weekly meal preparation session</div>
        </div>
        <div className={`ml-auto px-2 py-1 rounded-lg text-xs font-semibold ${
          hydrated && currentWeekLog.mealPrepDone ? 'bg-[#51cf6620] text-[#51cf66]' : 'bg-[#ffffff10] text-gray-400'
        }`}>
          {hydrated && currentWeekLog.mealPrepDone ? 'Done ✓' : 'Pending'}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Dumbbell, BookOpen, UtensilsCrossed, Music, Zap } from 'lucide-react'

const DAYS     = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const GYM_DAYS   = ['monday', 'wednesday', 'friday', 'saturday']
const STUDY_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

interface Event {
  date: string
  title: string
  category: 'concert' | 'deadline' | 'general'
}

const UPCOMING_EVENTS: Event[] = [
  { date: 'Mar 29', title: 'Tohir Sodikov Concert', category: 'concert' },
  { date: 'Apr 1',  title: 'Million Concert',       category: 'concert' },
]

// --- Gym Progress Ring ---
function GymRing({ count, total }: { count: number; total: number }) {
  const r    = 32
  const circ = 2 * Math.PI * r
  const pct  = total > 0 ? count / total : 0
  const offset = circ - pct * circ

  return (
    <svg
      width="88" height="88" viewBox="0 0 88 88"
      role="img"
      aria-label={`${count} of ${total} gym sessions this week`}
    >
      {/* Track */}
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
      {/* Fill */}
      <circle
        cx="44" cy="44" r={r}
        fill="none"
        stroke={count === total ? '#0ECA96' : '#FF4757'}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${offset}`}
        transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dashoffset 0.65s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Number */}
      <text
        x="44" y="40"
        textAnchor="middle"
        fill="#ECEDF3"
        fontSize="21"
        fontWeight="700"
        style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
      >
        {count}/{total}
      </text>
      {/* Label */}
      <text
        x="44" y="56"
        textAnchor="middle"
        fill="#8181A0"
        fontSize="8.5"
        style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif', letterSpacing: '1.2px' }}
      >
        SESSIONS
      </text>
    </svg>
  )
}

// --- Stat Card ---
function StatCard({
  value, label, color, suffix,
}: {
  value: string | number
  label: string
  color: string
  suffix?: string
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 py-4">
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-3xl leading-none"
          style={{
            fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif',
            letterSpacing: '0.04em',
            color,
          }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-base text-[#555568]" style={{ fontFamily: 'var(--font-bebas), sans-serif' }}>
            {suffix}
          </span>
        )}
      </div>
      <span className="text-[11px] text-[#8181A0] uppercase tracking-widest font-medium">{label}</span>
    </div>
  )
}

export default function Dashboard() {
  const { currentWeekLog, logGym, logMood, addPages } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [moodInput,  setMoodInput]  = useState('')
  const [pagesInput, setPagesInput] = useState('')
  const [hydrated,   setHydrated]   = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  const gymCount  = hydrated ? currentWeekLog.gymDays.length : 0
  const pagesRead = hydrated ? currentWeekLog.pagesRead : 0
  const avgMood   = hydrated && currentWeekLog.moodEntries.length > 0
    ? (currentWeekLog.moodEntries.reduce((s, e) => s + e.value, 0) / currentWeekLog.moodEntries.length).toFixed(1)
    : '—'

  // Next gym day not yet done
  const nextGymDay: string | null = (() => {
    if (!hydrated) return null
    const done = currentWeekLog.gymDays
    const dayNums: Record<string, number> = { monday: 1, wednesday: 3, friday: 5, saturday: 6 }
    const todayNum = new Date().getDay() // 0=Sun
    const upcoming = GYM_DAYS
      .filter(d => !done.includes(d))
      .map(d => ({ d, n: dayNums[d] }))
      .filter(x => x.n >= todayNum)
      .sort((a, b) => a.n - b.n)
    return upcoming[0]?.d ?? (GYM_DAYS.find(d => !done.includes(d)) ?? null)
  })()

  function handleLogGym(dayKey: string) {
    logGym(dayKey)
    const wasLogged = hydrated && currentWeekLog.gymDays.includes(dayKey)
    show(wasLogged ? 'Session removed' : 'Gym logged!')
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
    const day   = today.getDay()
    const diff  = today.getDate() - day + (day === 0 ? -6 : 1)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(diff + i)
      return d.getDate().toString()
    })
  }

  const weekDates  = getWeekDates()
  const todayIndex = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1 })()

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast} onDone={hide} />}

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={gymCount}  label="Gym"   color="#FF4757" suffix="/4" />
        <StatCard value={pagesRead} label="Pages"  color="#0ECA96" />
        <StatCard value={avgMood}   label="Mood"   color="#8B70FA" />
      </div>

      {/* ── Gym Progress ── */}
      <div className="card">
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="shrink-0">
            <GymRing count={gymCount} total={4} />
          </div>

          {/* Day buttons */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              {GYM_DAYS.map(d => {
                const logged = hydrated && currentWeekLog.gymDays.includes(d)
                const label  = d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)
                const isNext = d === nextGymDay && !logged
                return (
                  <button
                    key={d}
                    onClick={() => handleLogGym(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer touch-target flex items-center gap-1.5 ${
                      logged
                        ? 'text-white'
                        : isNext
                          ? 'bg-[rgba(255,71,87,0.12)] text-[#FF4757] border border-[rgba(255,71,87,0.3)]'
                          : 'bg-[rgba(255,255,255,0.04)] text-[#8181A0] border border-[rgba(255,255,255,0.07)] hover:text-[#ECEDF3]'
                    }`}
                    style={logged ? { background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)' } : {}}
                    aria-pressed={logged}
                    aria-label={`Log ${d} gym session`}
                  >
                    {logged && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#FF4757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {label}
                  </button>
                )
              })}
            </div>
            {gymCount < 4 && nextGymDay && (
              <p className="text-xs text-[#8181A0] flex items-center gap-1.5">
                <Zap size={11} className="text-[#FF4757]" />
                Next session:&nbsp;
                <span className="text-[#ECEDF3] font-medium capitalize">{nextGymDay}</span>
              </p>
            )}
            {gymCount === 4 && (
              <p className="text-xs text-[#0ECA96] font-medium flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0ECA96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Full week complete — great work!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Weekly Calendar ── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[#8181A0] uppercase tracking-widest mb-3">
          This Week
        </h2>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((day, i) => {
            const dayKey    = DAY_KEYS[i]
            const isGym     = GYM_DAYS.includes(dayKey)
            const isStudy   = STUDY_DAYS.includes(dayKey)
            const isMeal    = dayKey === 'sunday'
            const isToday   = i === todayIndex
            const gymLogged = hydrated && currentWeekLog.gymDays.includes(dayKey)

            return (
              <div
                key={day}
                className={`rounded-xl p-2 flex flex-col gap-1.5 min-h-[90px] border transition-colors ${
                  isToday
                    ? 'border-[rgba(255,71,87,0.4)] bg-[rgba(255,71,87,0.05)]'
                    : 'border-[rgba(255,255,255,0.07)] bg-[#0B0B13]'
                }`}
              >
                <div className={`text-center text-[11px] font-semibold ${isToday ? 'text-[#FF4757]' : 'text-[#8181A0]'}`}>
                  {day}
                </div>
                <div className="text-center text-[10px] text-[#555568]">{weekDates[i]}</div>
                <div className="flex flex-col gap-1 mt-auto">
                  {isGym && (
                    <button
                      onClick={() => handleLogGym(dayKey)}
                      className={`text-[10px] rounded-md px-1 py-0.5 transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                        gymLogged
                          ? 'bg-[rgba(255,71,87,0.25)] text-[#FF4757]'
                          : 'bg-[rgba(255,71,87,0.08)] text-[rgba(255,71,87,0.6)] hover:bg-[rgba(255,71,87,0.18)]'
                      }`}
                      aria-label={`Log ${dayKey} gym`}
                    >
                      <Dumbbell size={9} />
                      {gymLogged ? ' ✓' : ''}
                    </button>
                  )}
                  {isStudy && (
                    <div className="text-[10px] rounded-md px-1 py-0.5 bg-[rgba(139,112,250,0.1)] text-[rgba(139,112,250,0.7)] flex items-center justify-center gap-0.5">
                      <BookOpen size={9} />
                    </div>
                  )}
                  {isMeal && (
                    <div className="text-[10px] rounded-md px-1 py-0.5 bg-[rgba(14,202,150,0.1)] text-[rgba(14,202,150,0.7)] flex items-center justify-center">
                      <UtensilsCrossed size={9} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Quick Log ── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[#8181A0] uppercase tracking-widest mb-4">
          Quick Log
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Log Gym */}
          <div className="card-inner p-3 space-y-2.5">
            <div className="flex items-center gap-2 text-[#FF4757] text-sm font-semibold">
              <Dumbbell size={14} /> Gym Session
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GYM_DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => handleLogGym(d)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg capitalize font-medium transition-all duration-200 cursor-pointer touch-target ${
                    hydrated && currentWeekLog.gymDays.includes(d)
                      ? 'bg-[rgba(255,71,87,0.22)] text-[#FF4757] border border-[rgba(255,71,87,0.35)]'
                      : 'bg-[rgba(255,71,87,0.07)] text-[rgba(255,71,87,0.65)] border border-transparent hover:bg-[rgba(255,71,87,0.15)]'
                  }`}
                  aria-pressed={hydrated && currentWeekLog.gymDays.includes(d)}
                >
                  {d.slice(0, 3)} {hydrated && currentWeekLog.gymDays.includes(d) ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Log Mood */}
          <div className="card-inner p-3 space-y-2.5">
            <div className="flex items-center gap-2 text-[#8B70FA] text-sm font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              Mood (1–10)
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={moodInput}
                onChange={e => setMoodInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogMood()}
                placeholder="1–10"
                className="flex-1 bg-[#09090F] border border-[rgba(139,112,250,0.25)] text-white rounded-xl px-3 py-2.5 text-sm focus:border-[#8B70FA] transition-colors"
                aria-label="Mood value 1 to 10"
              />
              <button
                onClick={handleLogMood}
                className="bg-[rgba(139,112,250,0.18)] text-[#8B70FA] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[rgba(139,112,250,0.28)] transition-colors cursor-pointer touch-target"
              >
                Log
              </button>
            </div>
          </div>

          {/* Log Pages */}
          <div className="card-inner p-3 space-y-2.5">
            <div className="flex items-center gap-2 text-[#0ECA96] text-sm font-semibold">
              <BookOpen size={14} /> Pages Read
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={pagesInput}
                onChange={e => setPagesInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPages()}
                placeholder="e.g. 20"
                className="flex-1 bg-[#09090F] border border-[rgba(14,202,150,0.25)] text-white rounded-xl px-3 py-2.5 text-sm focus:border-[#0ECA96] transition-colors"
                aria-label="Number of pages read"
              />
              <button
                onClick={handleAddPages}
                className="bg-[rgba(14,202,150,0.18)] text-[#0ECA96] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[rgba(14,202,150,0.28)] transition-colors cursor-pointer touch-target"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Upcoming Events ── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[#8181A0] uppercase tracking-widest mb-3">
          Upcoming Events
        </h2>
        <div className="space-y-2">
          {UPCOMING_EVENTS.map(ev => (
            <div
              key={ev.title}
              className="card-inner flex items-center gap-3 px-3 py-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(245,185,66,0.15)' }}
              >
                <Music size={15} style={{ color: '#F5B942' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{ev.title}</div>
                <div className="text-[#8181A0] text-xs mt-0.5">{ev.date}</div>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-lg font-medium shrink-0"
                style={{ background: 'rgba(245,185,66,0.12)', color: '#F5B942' }}
              >
                Concert
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Meal Prep ── */}
      <div
        className="card flex items-center gap-3"
        style={{ borderColor: hydrated && currentWeekLog.mealPrepDone ? 'rgba(14,202,150,0.2)' : undefined }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(14,202,150,0.12)' }}
        >
          <UtensilsCrossed size={16} style={{ color: '#0ECA96' }} />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">Sunday Meal Prep</div>
          <div className="text-[#8181A0] text-xs mt-0.5">Weekly meal preparation session</div>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-xl font-semibold shrink-0"
          style={
            hydrated && currentWeekLog.mealPrepDone
              ? { background: 'rgba(14,202,150,0.15)', color: '#0ECA96' }
              : { background: 'rgba(255,255,255,0.06)', color: '#555568' }
          }
        >
          {hydrated && currentWeekLog.mealPrepDone ? 'Done' : 'Pending'}
        </span>
      </div>
    </div>
  )
}

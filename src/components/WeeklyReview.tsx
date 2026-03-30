'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Toast, useToast } from './Toast'
import dynamic from 'next/dynamic'
import { Dumbbell, BookOpen, UtensilsCrossed, TrendingUp } from 'lucide-react'

const AreaChart       = dynamic(() => import('recharts').then(m => m.AreaChart),       { ssr: false })
const Area            = dynamic(() => import('recharts').then(m => m.Area),            { ssr: false })
const XAxis           = dynamic(() => import('recharts').then(m => m.XAxis),           { ssr: false })
const YAxis           = dynamic(() => import('recharts').then(m => m.YAxis),           { ssr: false })
const CartesianGrid   = dynamic(() => import('recharts').then(m => m.CartesianGrid),   { ssr: false })
const Tooltip         = dynamic(() => import('recharts').then(m => m.Tooltip),         { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

function getWeekStart(date: Date): string {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default function WeeklyReview() {
  const { currentWeekLog, weeklyReviews, updateWeeklyReview, toggleMealPrep } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [hydrated,     setHydrated]     = useState(false)
  const [localReview,  setLocalReview]  = useState({ whatWentWell: '', whatToImprove: '' })

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated) {
      const weekStart = getWeekStart(new Date())
      const existing  = weeklyReviews.find(r => r.weekStart === weekStart)
      if (existing) {
        setLocalReview({ whatWentWell: existing.whatWentWell, whatToImprove: existing.whatToImprove })
      }
    }
  }, [hydrated, weeklyReviews])

  if (!hydrated) {
    return <div className="text-[#555568] text-center py-16">Loading…</div>
  }

  const gymCount    = currentWeekLog.gymDays.length
  const pagesRead   = currentWeekLog.pagesRead
  const mealPrepDone = currentWeekLog.mealPrepDone
  const avgMood     = currentWeekLog.moodEntries.length > 0
    ? currentWeekLog.moodEntries.reduce((s, e) => s + e.value, 0) / currentWeekLog.moodEntries.length
    : 0
  const isOnTrack   = gymCount >= 3 && pagesRead >= 50

  const moodChartData = [...currentWeekLog.moodEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: e.value,
    }))

  function saveReview() {
    updateWeeklyReview({
      whatWentWell:   localReview.whatWentWell,
      whatToImprove:  localReview.whatToImprove,
      gymCount,
      pagesRead,
      mealPrepDone,
    })
    show('Review saved!')
  }

  const gymPct    = Math.round((gymCount / 4) * 100)
  const pagesPct  = Math.min(100, Math.round((pagesRead / 50) * 100))

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast} onDone={hide} />}

      {/* ── Status Banner ── */}
      <div
        className="card flex items-center justify-between gap-4 py-4 px-5"
        style={{
          background: isOnTrack
            ? 'linear-gradient(135deg, rgba(14,202,150,0.12) 0%, rgba(14,202,150,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255,71,87,0.12) 0%, rgba(255,71,87,0.05) 100%)',
          borderColor: isOnTrack ? 'rgba(14,202,150,0.25)' : 'rgba(255,71,87,0.25)',
        }}
      >
        <div>
          <h2 className="text-white font-semibold text-base">Weekly Review</h2>
          <p className="text-[#8181A0] text-xs mt-0.5">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={
            isOnTrack
              ? { background: 'rgba(14,202,150,0.18)', color: '#0ECA96' }
              : { background: 'rgba(255,71,87,0.18)', color: '#FF4757' }
          }
        >
          <TrendingUp size={14} />
          {isOnTrack ? 'On Track' : 'Behind'}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gym */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#FF4757]">
              <Dumbbell size={14} /> Gym
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={
                gymCount >= 3
                  ? { background: 'rgba(14,202,150,0.14)', color: '#0ECA96' }
                  : { background: 'rgba(255,71,87,0.14)',  color: '#FF4757' }
              }
            >
              {gymCount >= 3 ? 'Good' : 'Need more'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl leading-none"
              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif', color: '#FF4757' }}
            >
              {gymCount}
            </span>
            <span className="text-[#555568]" style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.1rem' }}>/4</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${gymPct}%`, background: gymCount >= 3 ? '#0ECA96' : '#FF4757' }}
            />
          </div>
        </div>

        {/* Pages */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0ECA96]">
              <BookOpen size={14} /> Pages
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={
                pagesRead >= 50
                  ? { background: 'rgba(14,202,150,0.14)', color: '#0ECA96' }
                  : { background: 'rgba(255,255,255,0.07)', color: '#8181A0' }
              }
            >
              {pagesRead >= 50 ? 'Great' : 'Goal: 50'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl leading-none"
              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif', color: '#0ECA96' }}
            >
              {pagesRead}
            </span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pagesPct}%`, background: '#0ECA96' }}
            />
          </div>
        </div>

        {/* Mood */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#8B70FA]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            Mood Avg
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl leading-none"
              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif', color: '#8B70FA' }}
            >
              {avgMood > 0 ? avgMood.toFixed(1) : '—'}
            </span>
            {avgMood > 0 && (
              <span className="text-xs text-[#555568]">/10</span>
            )}
          </div>
          <p className="text-xs text-[#555568]">{currentWeekLog.moodEntries.length} entries this week</p>
        </div>

        {/* Meal Prep */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0ECA96]">
            <UtensilsCrossed size={14} /> Meal Prep
          </div>
          <button
            onClick={toggleMealPrep}
            className="flex items-center gap-2 cursor-pointer transition-all"
            aria-pressed={mealPrepDone}
            aria-label={mealPrepDone ? 'Meal prep done, click to undo' : 'Mark meal prep as done'}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
              style={
                mealPrepDone
                  ? { background: 'rgba(14,202,150,0.2)', border: '1px solid rgba(14,202,150,0.4)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              {mealPrepDone ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5 6.5-6.5" stroke="#0ECA96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-[#555568]" />
              )}
            </div>
            <span
              className="text-sm font-medium transition-colors"
              style={{ color: mealPrepDone ? '#0ECA96' : '#8181A0' }}
            >
              {mealPrepDone ? 'Done' : 'Pending'}
            </span>
          </button>
          <p className="text-xs text-[#555568]">Sunday session</p>
        </div>
      </div>

      {/* ── Mood Chart ── */}
      <div className="card">
        <h3 className="text-sm font-semibold text-[#8181A0] uppercase tracking-widest mb-4">
          Mood This Week
        </h3>
        {moodChartData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodChartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#8B70FA" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#8B70FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#555568', fontSize: 11, fontFamily: 'Outfit, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: '#555568', fontSize: 11, fontFamily: 'Outfit, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip
                  contentStyle={{
                    background: '#141422',
                    border: '1px solid rgba(139,112,250,0.25)',
                    borderRadius: '10px',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#ECEDF3', fontWeight: 600 }}
                  itemStyle={{ color: '#8B70FA' }}
                  cursor={{ stroke: 'rgba(139,112,250,0.3)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="#8B70FA"
                  strokeWidth={2.5}
                  fill="url(#moodGrad)"
                  dot={{ fill: '#141422', stroke: '#8B70FA', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 5, fill: '#8B70FA', stroke: '#141422', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : moodChartData.length === 1 ? (
          <div className="h-32 flex flex-col items-center justify-center gap-2">
            <span
              className="text-5xl leading-none"
              style={{ fontFamily: 'var(--font-bebas), sans-serif', color: '#8B70FA' }}
            >
              {moodChartData[0].mood}
            </span>
            <p className="text-xs text-[#555568]">Log more days to see your trend</p>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-[#555568] text-sm text-center px-4">
            No mood entries yet. Log your mood from the Dashboard tab.
          </div>
        )}
      </div>

      {/* ── Reflection ── */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-[#8181A0] uppercase tracking-widest">
          Weekly Reflection
        </h3>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold"
            style={{ color: '#0ECA96' }}
            htmlFor="went-well"
          >
            What went well
          </label>
          <textarea
            id="went-well"
            value={localReview.whatWentWell}
            onChange={e => setLocalReview(r => ({ ...r, whatWentWell: e.target.value }))}
            rows={3}
            placeholder="Wins, achievements, proud moments…"
            className="w-full bg-[#09090F] text-white rounded-xl px-3 py-2.5 text-sm resize-none transition-colors"
            style={{ border: '1px solid rgba(14,202,150,0.2)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(14,202,150,0.5)')}
            onBlur={e  => (e.target.style.borderColor = 'rgba(14,202,150,0.2)')}
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold"
            style={{ color: '#FF4757' }}
            htmlFor="to-improve"
          >
            What to improve
          </label>
          <textarea
            id="to-improve"
            value={localReview.whatToImprove}
            onChange={e => setLocalReview(r => ({ ...r, whatToImprove: e.target.value }))}
            rows={3}
            placeholder="Areas for growth, lessons learned, next steps…"
            className="w-full bg-[#09090F] text-white rounded-xl px-3 py-2.5 text-sm resize-none transition-colors"
            style={{ border: '1px solid rgba(255,71,87,0.2)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,71,87,0.5)')}
            onBlur={e  => (e.target.style.borderColor = 'rgba(255,71,87,0.2)')}
          />
        </div>

        <button
          onClick={saveReview}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #8B70FA 0%, #FF4757 100%)', color: 'white' }}
        >
          Save Weekly Review
        </button>
      </div>
    </div>
  )
}

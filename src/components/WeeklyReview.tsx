'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Toast, useToast } from './Toast'
import dynamic from 'next/dynamic'

const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
)
const Line = dynamic(
  () => import('recharts').then(mod => mod.Line),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
)

export default function WeeklyReview() {
  const { currentWeekLog, weeklyReviews, updateWeeklyReview, toggleMealPrep } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [hydrated, setHydrated] = useState(false)
  const [localReview, setLocalReview] = useState({ whatWentWell: '', whatToImprove: '' })

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      const weekStart = getWeekStart(new Date())
      const existing = weeklyReviews.find(r => r.weekStart === weekStart)
      if (existing) {
        setLocalReview({
          whatWentWell: existing.whatWentWell,
          whatToImprove: existing.whatToImprove,
        })
      }
    }
  }, [hydrated, weeklyReviews])

  function getWeekStart(date: Date): string {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  if (!hydrated) {
    return <div className="text-gray-400 text-center py-10">Loading...</div>
  }

  const gymCount = currentWeekLog.gymDays.length
  const pagesRead = currentWeekLog.pagesRead
  const mealPrepDone = currentWeekLog.mealPrepDone
  const avgMood = currentWeekLog.moodEntries.length > 0
    ? currentWeekLog.moodEntries.reduce((s, e) => s + e.value, 0) / currentWeekLog.moodEntries.length
    : 0

  const isOnTrack = gymCount >= 3 && pagesRead >= 50

  const moodChartData = currentWeekLog.moodEntries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: e.value,
    }))

  function saveReview() {
    updateWeeklyReview({
      whatWentWell: localReview.whatWentWell,
      whatToImprove: localReview.whatToImprove,
      gymCount,
      pagesRead,
      mealPrepDone,
    })
    show('Review saved!')
  }

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast} onDone={hide} />}

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Weekly Review</h2>
        <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
          isOnTrack ? 'bg-[#51cf6620] text-[#51cf66]' : 'bg-[#ff6b6b20] text-[#ff6b6b]'
        }`}>
          {isOnTrack ? 'On Track ✓' : 'Behind ⚠'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#ff6b6b]">{gymCount}<span className="text-sm text-gray-400">/4</span></div>
          <div className="text-xs text-gray-400 mt-1">🏋️ Gym</div>
          <div className={`text-xs mt-1 ${gymCount >= 3 ? 'text-[#51cf66]' : 'text-[#ff6b6b]'}`}>
            {gymCount >= 3 ? 'Good' : 'Need more'}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#51cf66]">{pagesRead}</div>
          <div className="text-xs text-gray-400 mt-1">📚 Pages</div>
          <div className={`text-xs mt-1 ${pagesRead >= 50 ? 'text-[#51cf66]' : 'text-gray-400'}`}>
            {pagesRead >= 50 ? 'Great' : `Goal: 50`}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#a78bfa]">
            {avgMood > 0 ? avgMood.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">😊 Mood Avg</div>
          <div className="text-xs text-gray-500 mt-1">{currentWeekLog.moodEntries.length} entries</div>
        </div>
        <div className="card text-center">
          <button
            onClick={toggleMealPrep}
            className={`text-2xl font-bold cursor-pointer transition-all ${mealPrepDone ? 'text-[#51cf66]' : 'text-gray-500 hover:text-[#51cf66]'}`}
          >
            {mealPrepDone ? '✓' : '○'}
          </button>
          <div className="text-xs text-gray-400 mt-1">🍽️ Meal Prep</div>
          <div className={`text-xs mt-1 ${mealPrepDone ? 'text-[#51cf66]' : 'text-gray-500'}`}>
            {mealPrepDone ? 'Done' : 'Pending'}
          </div>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Mood This Week</h3>
        {moodChartData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={{ fill: '#a78bfa', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
            No mood entries this week. Log your mood from the Dashboard tab.
          </div>
        )}
      </div>

      {/* Reflection */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-white">Weekly Reflection</h3>

        <div className="space-y-1">
          <label className="text-xs text-[#51cf66] font-medium">What went well? ✓</label>
          <textarea
            value={localReview.whatWentWell}
            onChange={e => setLocalReview(r => ({ ...r, whatWentWell: e.target.value }))}
            rows={3}
            placeholder="Wins, achievements, proud moments..."
            className="w-full bg-[#0f0f1a] border border-[#51cf6630] text-white rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#51cf66]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[#ff6b6b] font-medium">What to improve? ↑</label>
          <textarea
            value={localReview.whatToImprove}
            onChange={e => setLocalReview(r => ({ ...r, whatToImprove: e.target.value }))}
            rows={3}
            placeholder="Areas for growth, lessons learned, next steps..."
            className="w-full bg-[#0f0f1a] border border-[#ff6b6b30] text-white rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#ff6b6b]"
          />
        </div>

        <button
          onClick={saveReview}
          className="w-full bg-[#a78bfa] text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          Save Weekly Review
        </button>
      </div>
    </div>
  )
}

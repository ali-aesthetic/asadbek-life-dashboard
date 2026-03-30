'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore, BookStatus } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Star, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

const STATUS_LABELS: Record<BookStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'Reading',
  completed:   'Completed',
}

const STATUS_STYLE: Record<BookStatus, { bg: string; text: string; border: string }> = {
  not_started: { bg: 'rgba(255,255,255,0.05)', text: '#555568',   border: 'rgba(255,255,255,0.07)' },
  in_progress: { bg: 'rgba(139,112,250,0.14)', text: '#8B70FA',   border: 'rgba(139,112,250,0.3)' },
  completed:   { bg: 'rgba(14,202,150,0.14)',  text: '#0ECA96',   border: 'rgba(14,202,150,0.3)' },
}

const PROGRESS_COLOR: Record<BookStatus, string> = {
  not_started: 'rgba(255,255,255,0.15)',
  in_progress: '#8B70FA',
  completed:   '#0ECA96',
}

export default function Books() {
  const { books, updateBook } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [localPages, setLocalPages] = useState<Record<string, string>>({})
  const [hydrated,   setHydrated]   = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated) {
      const notes: Record<string, string> = {}
      const pages: Record<string, string> = {}
      books.forEach(b => {
        notes[b.id] = b.notes
        pages[b.id] = b.currentPage.toString()
      })
      setLocalNotes(notes)
      setLocalPages(pages)
    }
  }, [hydrated, books])

  if (!hydrated) {
    return <div className="text-[#555568] text-center py-16">Loading…</div>
  }

  function cycleStatus(id: string, current: BookStatus) {
    const statuses: BookStatus[] = ['not_started', 'in_progress', 'completed']
    const next = statuses[(statuses.indexOf(current) + 1) % statuses.length]
    updateBook(id, { status: next })
    show('Status updated!')
  }

  function saveNote(id: string) {
    updateBook(id, { notes: localNotes[id] || '' })
    show('Notes saved!')
  }

  function savePages(id: string, totalPages: number) {
    const v       = parseInt(localPages[id] || '0')
    const clamped = Math.max(0, Math.min(v, totalPages))
    updateBook(id, { currentPage: clamped })
    show('Progress saved!')
  }

  function setRating(id: string, rating: number) {
    updateBook(id, { rating })
    show('Rating saved!')
  }

  const completedCount  = books.filter(b => b.status === 'completed').length
  const inProgressCount = books.filter(b => b.status === 'in_progress').length
  const notStartedCount = books.length - completedCount - inProgressCount

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast} onDone={hide} />}

      {/* ── Summary ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: completedCount,  label: 'Completed', color: '#0ECA96' },
          { value: inProgressCount, label: 'Reading',   color: '#8B70FA' },
          { value: notStartedCount, label: 'To Read',   color: '#555568' },
        ].map(({ value, label, color }) => (
          <div key={label} className="card flex flex-col items-center justify-center py-4 gap-1">
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
            <span className="text-[11px] text-[#8181A0] uppercase tracking-widest font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Book List ── */}
      <div className="space-y-3">
        {books.map(book => {
          const isOpen   = expanded === book.id
          const progress = book.totalPages > 0
            ? Math.round((book.currentPage / book.totalPages) * 100)
            : 0
          const st = STATUS_STYLE[book.status]

          return (
            <div key={book.id} className="card space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: st.bg }}
                  >
                    <BookOpen size={14} style={{ color: st.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm leading-snug truncate">{book.title}</h3>
                    <p className="text-[#8181A0] text-xs mt-0.5">{book.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => cycleStatus(book.id, book.status)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-200 cursor-pointer border"
                    style={{ background: st.bg, color: st.text, borderColor: st.border }}
                    aria-label={`Book status: ${STATUS_LABELS[book.status]}. Click to change.`}
                  >
                    {STATUS_LABELS[book.status]}
                  </button>
                  <button
                    onClick={() => setExpanded(isOpen ? null : book.id)}
                    className="text-[#555568] hover:text-[#ECEDF3] transition-colors cursor-pointer p-1"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? 'Collapse book details' : 'Expand book details'}
                  >
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#8181A0]">
                  <span>{book.currentPage} / {book.totalPages} pages</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: PROGRESS_COLOR[book.status],
                    }}
                  />
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1" role="group" aria-label={`Rating: ${book.rating} out of 5`}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(book.id, star)}
                    className="transition-transform hover:scale-110 cursor-pointer"
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    <Star
                      size={14}
                      className={star <= book.rating ? 'fill-current' : ''}
                      style={{ color: star <= book.rating ? '#F5B942' : '#3A3A4A' }}
                    />
                  </button>
                ))}
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="space-y-3 pt-3 border-t border-[rgba(255,255,255,0.07)]">
                  {/* Page input */}
                  <div className="flex gap-2 items-center">
                    <label className="text-xs text-[#8181A0] w-24 shrink-0" htmlFor={`page-${book.id}`}>
                      Current page
                    </label>
                    <input
                      id={`page-${book.id}`}
                      type="number"
                      min={0}
                      max={book.totalPages}
                      value={localPages[book.id] ?? book.currentPage}
                      onChange={e => setLocalPages(p => ({ ...p, [book.id]: e.target.value }))}
                      className="w-24 bg-[#09090F] border border-[rgba(139,112,250,0.25)] text-white rounded-xl px-3 py-2 text-sm focus:border-[#8B70FA] transition-colors"
                    />
                    <button
                      onClick={() => savePages(book.id, book.totalPages)}
                      className="text-xs bg-[rgba(139,112,250,0.14)] text-[#8B70FA] px-3 py-2 rounded-xl hover:bg-[rgba(139,112,250,0.25)] transition-colors cursor-pointer font-medium"
                    >
                      Save
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8181A0] font-medium" htmlFor={`notes-${book.id}`}>Notes</label>
                    <textarea
                      id={`notes-${book.id}`}
                      value={localNotes[book.id] ?? book.notes}
                      onChange={e => setLocalNotes(n => ({ ...n, [book.id]: e.target.value }))}
                      rows={3}
                      placeholder="Your thoughts, highlights, key ideas…"
                      className="w-full bg-[#09090F] border border-[rgba(255,255,255,0.1)] text-white rounded-xl px-3 py-2.5 text-sm resize-none focus:border-[rgba(139,112,250,0.4)] transition-colors"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => saveNote(book.id)}
                        className="text-xs bg-[rgba(14,202,150,0.14)] text-[#0ECA96] px-3 py-2 rounded-xl hover:bg-[rgba(14,202,150,0.25)] transition-colors cursor-pointer font-medium"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

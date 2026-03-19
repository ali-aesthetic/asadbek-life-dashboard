'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore, BookStatus } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Star, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_LABELS: Record<BookStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const STATUS_COLORS: Record<BookStatus, string> = {
  not_started: 'text-gray-400 bg-[#ffffff10]',
  in_progress: 'text-[#a78bfa] bg-[#a78bfa20]',
  completed: 'text-[#51cf66] bg-[#51cf6620]',
}

export default function Books() {
  const { books, updateBook } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [localPages, setLocalPages] = useState<Record<string, string>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

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
    return <div className="text-gray-400 text-center py-10">Loading...</div>
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
    const v = parseInt(localPages[id] || '0')
    const clamped = Math.max(0, Math.min(v, totalPages))
    updateBook(id, { currentPage: clamped })
    show('Progress saved!')
  }

  function setRating(id: string, rating: number) {
    updateBook(id, { rating })
    show('Rating saved!')
  }

  const completedCount = books.filter(b => b.status === 'completed').length
  const inProgressCount = books.filter(b => b.status === 'in_progress').length

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={hide} />}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#51cf66]">{completedCount}</div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-[#a78bfa]">{inProgressCount}</div>
          <div className="text-xs text-gray-400 mt-1">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">{books.length - completedCount - inProgressCount}</div>
          <div className="text-xs text-gray-400 mt-1">Not Started</div>
        </div>
      </div>

      {/* Book Cards */}
      <div className="space-y-3">
        {books.map(book => {
          const isOpen = expanded === book.id
          const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0

          return (
            <div key={book.id} className="card space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm leading-tight">{book.title}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{book.author}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => cycleStatus(book.id, book.status)}
                    className={`text-xs px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${STATUS_COLORS[book.status]}`}
                  >
                    {STATUS_LABELS[book.status]}
                  </button>
                  <button
                    onClick={() => setExpanded(isOpen ? null : book.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{book.currentPage} / {book.totalPages} pages</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[#ffffff10] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background: book.status === 'completed' ? '#51cf66' : book.status === 'in_progress' ? '#a78bfa' : '#ffffff30',
                    }}
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(book.id, star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={14}
                      className={star <= book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                    />
                  </button>
                ))}
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="space-y-3 pt-2 border-t border-[#ffffff10]">
                  {/* Page input */}
                  <div className="flex gap-2 items-center">
                    <label className="text-xs text-gray-400 w-24 shrink-0">Current page:</label>
                    <input
                      type="number"
                      min={0}
                      max={book.totalPages}
                      value={localPages[book.id] ?? book.currentPage}
                      onChange={e => setLocalPages(p => ({ ...p, [book.id]: e.target.value }))}
                      className="w-24 bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#a78bfa]"
                    />
                    <button
                      onClick={() => savePages(book.id, book.totalPages)}
                      className="text-xs bg-[#a78bfa20] text-[#a78bfa] px-3 py-1 rounded-lg hover:bg-[#a78bfa40] transition-colors"
                    >
                      Save
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Notes:</label>
                    <textarea
                      value={localNotes[book.id] ?? book.notes}
                      onChange={e => setLocalNotes(n => ({ ...n, [book.id]: e.target.value }))}
                      rows={3}
                      placeholder="Your thoughts, highlights, key ideas..."
                      className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#a78bfa]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => saveNote(book.id)}
                        className="text-xs bg-[#51cf6620] text-[#51cf66] px-3 py-1 rounded-lg hover:bg-[#51cf6640] transition-colors"
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

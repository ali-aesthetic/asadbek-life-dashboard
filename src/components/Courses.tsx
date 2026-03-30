'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore, Assignment } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Plus, Trash2, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react'

const COURSE_COLORS = [
  { bg: 'rgba(255,71,87,0.12)',   text: '#FF4757',   border: 'rgba(255,71,87,0.25)' },
  { bg: 'rgba(14,202,150,0.12)',  text: '#0ECA96',   border: 'rgba(14,202,150,0.25)' },
  { bg: 'rgba(139,112,250,0.12)', text: '#8B70FA',   border: 'rgba(139,112,250,0.25)' },
  { bg: 'rgba(245,185,66,0.12)',  text: '#F5B942',   border: 'rgba(245,185,66,0.25)' },
  { bg: 'rgba(99,179,237,0.12)',  text: '#63B3ED',   border: 'rgba(99,179,237,0.25)' },
]

export default function Courses() {
  const { courses, updateCourse, addAssignment, toggleAssignment, removeAssignment } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [expanded,      setExpanded]      = useState<string | null>(null)
  const [localNotes,    setLocalNotes]    = useState<Record<string, string>>({})
  const [newAssignment, setNewAssignment] = useState<Record<string, { title: string; dueDate: string }>>({})
  const [hydrated,      setHydrated]      = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated) {
      const notes: Record<string, string> = {}
      courses.forEach(c => { notes[c.id] = c.notes })
      setLocalNotes(notes)
    }
  }, [hydrated, courses])

  if (!hydrated) {
    return <div className="text-[#555568] text-center py-16">Loading…</div>
  }

  function saveNote(id: string) {
    updateCourse(id, { notes: localNotes[id] || '' })
    show('Notes saved!')
  }

  function handleAddAssignment(courseId: string) {
    const data = newAssignment[courseId]
    if (!data?.title?.trim()) return
    const assignment: Assignment = {
      id: Date.now().toString(),
      title: data.title,
      dueDate: data.dueDate || '',
      completed: false,
    }
    addAssignment(courseId, assignment)
    setNewAssignment(a => ({ ...a, [courseId]: { title: '', dueDate: '' } }))
    show('Assignment added!')
  }

  function handleProgressChange(id: string, value: number) {
    updateCourse(id, { progress: value })
  }

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={hide} />}

      <div className="space-y-3">
        {courses.map((course, idx) => {
          const isOpen         = expanded === course.id
          const completedCount = course.assignments.filter(a => a.completed).length
          const color          = COURSE_COLORS[idx % COURSE_COLORS.length]

          return (
            <div key={course.id} className="card space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: color.bg, border: `1px solid ${color.border}` }}
                  >
                    <GraduationCap size={15} style={{ color: color.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{course.name}</h3>
                    {course.instructor && (
                      <p className="text-[#8181A0] text-xs mt-0.5">{course.instructor}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {course.progress}%
                  </span>
                  <button
                    onClick={() => setExpanded(isOpen ? null : course.id)}
                    className="text-[#555568] hover:text-[#ECEDF3] transition-colors cursor-pointer p-1"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? 'Collapse course' : 'Expand course'}
                  >
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%`, background: color.text }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={course.progress}
                  onChange={e => handleProgressChange(course.id, parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: color.text }}
                  aria-label={`${course.name} progress: ${course.progress}%`}
                />
              </div>

              {/* Assignment count */}
              {course.assignments.length > 0 && (
                <p className="text-xs text-[#8181A0]">
                  Assignments:&nbsp;
                  <span className="text-[#ECEDF3] font-medium">
                    {completedCount}/{course.assignments.length}
                  </span>
                  &nbsp;completed
                </p>
              )}

              {/* Expanded */}
              {isOpen && (
                <div className="space-y-4 pt-3 border-t border-[rgba(255,255,255,0.07)]">
                  {/* Assignment list */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#ECEDF3]">Assignments</h4>
                    {course.assignments.length === 0 && (
                      <p className="text-[#555568] text-xs">No assignments yet.</p>
                    )}
                    {course.assignments.map(a => (
                      <div
                        key={a.id}
                        className="card-inner flex items-center gap-2.5 px-3 py-2.5"
                      >
                        <input
                          type="checkbox"
                          checked={a.completed}
                          onChange={() => toggleAssignment(course.id, a.id)}
                          className="shrink-0"
                          aria-label={`Toggle assignment: ${a.title}`}
                        />
                        <span className={`flex-1 text-sm ${a.completed ? 'line-through text-[#555568]' : 'text-[#ECEDF3]'}`}>
                          {a.title}
                        </span>
                        {a.dueDate && (
                          <span className="text-xs text-[#8181A0] shrink-0">
                            {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <button
                          onClick={() => removeAssignment(course.id, a.id)}
                          className="text-[#555568] hover:text-[#FF4757] transition-colors cursor-pointer shrink-0"
                          aria-label={`Remove assignment: ${a.title}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Add Assignment */}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Assignment title"
                        value={newAssignment[course.id]?.title || ''}
                        onChange={e => setNewAssignment(a => ({ ...a, [course.id]: { ...a[course.id], title: e.target.value } }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddAssignment(course.id)}
                        className="flex-1 bg-[#09090F] border border-[rgba(255,255,255,0.1)] text-white rounded-xl px-3 py-2 text-sm focus:border-[rgba(139,112,250,0.4)] transition-colors"
                        aria-label="New assignment title"
                      />
                      <input
                        type="date"
                        value={newAssignment[course.id]?.dueDate || ''}
                        onChange={e => setNewAssignment(a => ({ ...a, [course.id]: { ...a[course.id], dueDate: e.target.value } }))}
                        className="bg-[#09090F] border border-[rgba(255,255,255,0.1)] text-white rounded-xl px-2 py-2 text-sm focus:border-[rgba(139,112,250,0.4)] transition-colors"
                        aria-label="Assignment due date"
                      />
                      <button
                        onClick={() => handleAddAssignment(course.id)}
                        className="p-2 rounded-xl cursor-pointer transition-colors"
                        style={{ background: color.bg, color: color.text }}
                        aria-label="Add assignment"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8181A0] font-medium" htmlFor={`course-notes-${course.id}`}>Notes</label>
                    <textarea
                      id={`course-notes-${course.id}`}
                      value={localNotes[course.id] ?? course.notes}
                      onChange={e => setLocalNotes(n => ({ ...n, [course.id]: e.target.value }))}
                      rows={3}
                      placeholder="Course notes, key topics, reminders…"
                      className="w-full bg-[#09090F] border border-[rgba(255,255,255,0.1)] text-white rounded-xl px-3 py-2.5 text-sm resize-none focus:border-[rgba(139,112,250,0.4)] transition-colors"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => saveNote(course.id)}
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

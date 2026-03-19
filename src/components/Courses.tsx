'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore, Assignment } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function Courses() {
  const { courses, updateCourse, addAssignment, toggleAssignment, removeAssignment } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [newAssignment, setNewAssignment] = useState<Record<string, { title: string; dueDate: string }>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      const notes: Record<string, string> = {}
      courses.forEach(c => { notes[c.id] = c.notes })
      setLocalNotes(notes)
    }
  }, [hydrated, courses])

  if (!hydrated) {
    return <div className="text-gray-400 text-center py-10">Loading...</div>
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
        {courses.map(course => {
          const isOpen = expanded === course.id
          const completedCount = course.assignments.filter(a => a.completed).length

          return (
            <div key={course.id} className="card space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{course.name}</h3>
                  {course.instructor && (
                    <p className="text-gray-400 text-xs mt-0.5">Instructor: {course.instructor}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#a78bfa] bg-[#a78bfa20] px-2 py-1 rounded-lg">
                    {course.progress}%
                  </span>
                  <button
                    onClick={() => setExpanded(isOpen ? null : course.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={course.progress}
                  onChange={e => handleProgressChange(course.id, parseInt(e.target.value))}
                  className="w-full accent-[#a78bfa] cursor-pointer"
                />
                <div className="w-full bg-[#ffffff10] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-[#a78bfa] transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* Assignments summary */}
              {course.assignments.length > 0 && (
                <div className="text-xs text-gray-400">
                  Assignments: {completedCount}/{course.assignments.length} completed
                </div>
              )}

              {/* Expanded */}
              {isOpen && (
                <div className="space-y-4 pt-3 border-t border-[#ffffff10]">
                  {/* Assignments */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Assignments</h4>
                    {course.assignments.length === 0 && (
                      <p className="text-gray-500 text-xs">No assignments yet.</p>
                    )}
                    {course.assignments.map(a => (
                      <div key={a.id} className="flex items-center gap-2 bg-[#0f0f1a] border border-[#ffffff10] rounded-lg px-3 py-2">
                        <input
                          type="checkbox"
                          checked={a.completed}
                          onChange={() => toggleAssignment(course.id, a.id)}
                          className="accent-[#51cf66] cursor-pointer"
                        />
                        <span className={`flex-1 text-sm ${a.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {a.title}
                        </span>
                        {a.dueDate && (
                          <span className="text-xs text-gray-500">{a.dueDate}</span>
                        )}
                        <button
                          onClick={() => removeAssignment(course.id, a.id)}
                          className="text-gray-500 hover:text-[#ff6b6b] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Add Assignment */}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Assignment title"
                        value={newAssignment[course.id]?.title || ''}
                        onChange={e => setNewAssignment(a => ({
                          ...a,
                          [course.id]: { ...a[course.id], title: e.target.value }
                        }))}
                        className="flex-1 bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#a78bfa]"
                      />
                      <input
                        type="date"
                        value={newAssignment[course.id]?.dueDate || ''}
                        onChange={e => setNewAssignment(a => ({
                          ...a,
                          [course.id]: { ...a[course.id], dueDate: e.target.value }
                        }))}
                        className="bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#a78bfa]"
                      />
                      <button
                        onClick={() => handleAddAssignment(course.id)}
                        className="bg-[#a78bfa] text-white p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Notes:</label>
                    <textarea
                      value={localNotes[course.id] ?? course.notes}
                      onChange={e => setLocalNotes(n => ({ ...n, [course.id]: e.target.value }))}
                      rows={3}
                      placeholder="Course notes, key topics, reminders..."
                      className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#a78bfa]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => saveNote(course.id)}
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

'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore, Project } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Plus, Pencil, Trash2, Check, X, FolderKanban } from 'lucide-react'

function getProgressStyle(progress: number): { color: string; label: string; bg: string } {
  if (progress >= 80) return { color: '#0ECA96', label: 'On Track',   bg: 'rgba(14,202,150,0.14)' }
  if (progress >= 40) return { color: '#8B70FA', label: 'In Progress', bg: 'rgba(139,112,250,0.14)' }
  return                     { color: '#FF4757', label: 'Starting',    bg: 'rgba(255,71,87,0.14)' }
}

export default function Projects() {
  const { projects, addProject, updateProject, removeProject } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [hydrated,    setHydrated]    = useState(false)
  const [editing,     setEditing]     = useState<string | null>(null)
  const [showAdd,     setShowAdd]     = useState(false)
  const [editData,    setEditData]    = useState<Partial<Project>>({})
  const [newProject,  setNewProject]  = useState<Partial<Project>>({
    name: '', description: '', deadline: '', progress: 0,
  })

  useEffect(() => { setHydrated(true) }, [])

  if (!hydrated) {
    return <div className="text-[#555568] text-center py-16">Loading…</div>
  }

  function startEdit(project: Project) {
    setEditing(project.id)
    setEditData({ ...project })
  }

  function saveEdit(id: string) {
    updateProject(id, editData)
    setEditing(null)
    setEditData({})
    show('Project updated!')
  }

  function cancelEdit() {
    setEditing(null)
    setEditData({})
  }

  function handleAdd() {
    if (!newProject.name?.trim()) return
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description || '',
      deadline: newProject.deadline || '',
      progress: newProject.progress || 0,
    }
    addProject(project)
    setNewProject({ name: '', description: '', deadline: '', progress: 0 })
    setShowAdd(false)
    show('Project added!')
  }

  function handleDelete(id: string) {
    removeProject(id)
    show('Project removed!')
  }

  const inputClass = "w-full bg-[#09090F] border border-[rgba(255,255,255,0.1)] text-white rounded-xl px-3 py-2.5 text-sm focus:border-[rgba(255,71,87,0.4)] transition-colors"

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={hide} />}

      {/* Header row */}
      <div className="flex justify-between items-center">
        <h2
          className="text-lg font-semibold text-[#ECEDF3]"
          style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif', letterSpacing: '0.06em', fontSize: '1.4rem' }}
        >
          Projects
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer touch-target"
          style={{ background: 'rgba(255,71,87,0.14)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.25)' }}
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card space-y-3 border border-[rgba(255,71,87,0.2)] animate-scale-in">
          <h3 className="text-sm font-semibold text-[#ECEDF3]">New Project</h3>
          <input
            type="text"
            placeholder="Project name"
            value={newProject.name || ''}
            onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className={inputClass}
            aria-label="Project name"
          />
          <textarea
            placeholder="Description (optional)"
            value={newProject.description || ''}
            onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
            rows={2}
            className={`${inputClass} resize-none`}
            aria-label="Project description"
          />
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-[#8181A0]" htmlFor="new-deadline">Deadline</label>
              <input
                id="new-deadline"
                type="date"
                value={newProject.deadline || ''}
                onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-[#8181A0]">Progress: {newProject.progress || 0}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={newProject.progress || 0}
                onChange={e => setNewProject(p => ({ ...p, progress: parseInt(e.target.value) }))}
                className="w-full cursor-pointer mt-3"
                style={{ accentColor: '#FF4757' }}
                aria-label="Project progress"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAdd(false)}
              className="text-sm text-[#8181A0] hover:text-[#ECEDF3] px-3 py-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors"
              style={{ background: 'rgba(255,71,87,0.18)', color: '#FF4757' }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Project Cards */}
      <div className="space-y-3">
        {projects.map(project => {
          const isEditing = editing === project.id
          const ps        = getProgressStyle(project.progress)

          return (
            <div key={project.id} className="card space-y-3">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    className={inputClass}
                    aria-label="Edit project name"
                  />
                  <textarea
                    value={editData.description || ''}
                    onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    aria-label="Edit project description"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-[#8181A0]">Deadline</label>
                      <input
                        type="date"
                        value={editData.deadline || ''}
                        onChange={e => setEditData(d => ({ ...d, deadline: e.target.value }))}
                        className={inputClass}
                        aria-label="Edit deadline"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-[#8181A0]">Progress: {editData.progress || 0}%</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={editData.progress || 0}
                        onChange={e => setEditData(d => ({ ...d, progress: parseInt(e.target.value) }))}
                        className="w-full cursor-pointer mt-3"
                        style={{ accentColor: '#8B70FA' }}
                        aria-label="Edit progress"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="text-[#8181A0] hover:text-[#ECEDF3] p-2 transition-colors cursor-pointer"
                      aria-label="Cancel editing"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => saveEdit(project.id)}
                      className="text-[#0ECA96] hover:opacity-80 p-2 transition-opacity cursor-pointer"
                      aria-label="Save changes"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* View mode */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: ps.bg }}
                      >
                        <FolderKanban size={15} style={{ color: ps.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{project.name}</h3>
                        {project.description && (
                          <p className="text-[#8181A0] text-xs mt-0.5 leading-relaxed">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{ background: ps.bg, color: ps.color }}
                      >
                        {ps.label}
                      </span>
                      <button
                        onClick={() => startEdit(project)}
                        className="text-[#555568] hover:text-[#ECEDF3] p-1.5 transition-colors cursor-pointer"
                        aria-label={`Edit ${project.name}`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-[#555568] hover:text-[#FF4757] p-1.5 transition-colors cursor-pointer"
                        aria-label={`Delete ${project.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {project.deadline && (
                    <div className="text-xs text-[#8181A0]">
                      Deadline:&nbsp;
                      <span className="text-[#ECEDF3]">
                        {new Date(project.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[#8181A0]">
                      <span>Progress</span>
                      <span style={{ color: ps.color }}>{project.progress}%</span>
                    </div>
                    <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%`, background: ps.color }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}

        {projects.length === 0 && (
          <div className="card text-center py-12 text-[#555568]">
            <FolderKanban size={28} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No projects yet. Add one above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

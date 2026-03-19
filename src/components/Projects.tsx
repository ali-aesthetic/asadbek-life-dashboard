'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore, Project } from '@/lib/store'
import { Toast, useToast } from './Toast'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

export default function Projects() {
  const { projects, addProject, updateProject, removeProject } = useDashboardStore()
  const { toast, show, hide } = useToast()
  const [hydrated, setHydrated] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editData, setEditData] = useState<Partial<Project>>({})
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '', description: '', deadline: '', progress: 0
  })

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return <div className="text-gray-400 text-center py-10">Loading...</div>
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

  function getStatusColor(progress: number) {
    if (progress >= 80) return 'text-[#51cf66] bg-[#51cf6620]'
    if (progress >= 40) return 'text-[#a78bfa] bg-[#a78bfa20]'
    return 'text-[#ff6b6b] bg-[#ff6b6b20]'
  }

  function getStatusLabel(progress: number) {
    if (progress >= 80) return 'On Track'
    if (progress >= 40) return 'In Progress'
    return 'Starting'
  }

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={hide} />}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Projects</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 bg-[#ff6b6b] text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      {/* Add Project Form */}
      {showAdd && (
        <div className="card space-y-3 border border-[#ff6b6b30]">
          <h3 className="text-sm font-semibold text-white">New Project</h3>
          <input
            type="text"
            placeholder="Project name"
            value={newProject.name || ''}
            onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff6b6b]"
          />
          <textarea
            placeholder="Description"
            value={newProject.description || ''}
            onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#ff6b6b]"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Deadline</label>
              <input
                type="date"
                value={newProject.deadline || ''}
                onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))}
                className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#ff6b6b]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Progress: {newProject.progress || 0}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={newProject.progress || 0}
                onChange={e => setNewProject(p => ({ ...p, progress: parseInt(e.target.value) }))}
                className="w-full accent-[#ff6b6b] cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAdd(false)}
              className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="text-sm bg-[#ff6b6b] text-white px-4 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Project Cards */}
      <div className="space-y-4">
        {projects.map(project => {
          const isEditing = editing === project.id

          return (
            <div key={project.id} className="card space-y-3">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#a78bfa]"
                  />
                  <textarea
                    value={editData.description || ''}
                    onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#a78bfa]"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Deadline</label>
                      <input
                        type="date"
                        value={editData.deadline || ''}
                        onChange={e => setEditData(d => ({ ...d, deadline: e.target.value }))}
                        className="w-full bg-[#0f0f1a] border border-[#ffffff20] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Progress: {editData.progress || 0}%</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={editData.progress || 0}
                        onChange={e => setEditData(d => ({ ...d, progress: parseInt(e.target.value) }))}
                        className="w-full accent-[#a78bfa] cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="text-gray-400 hover:text-white p-1.5 transition-colors">
                      <X size={16} />
                    </button>
                    <button onClick={() => saveEdit(project.id)} className="text-[#51cf66] hover:opacity-80 p-1.5 transition-opacity">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-400 text-xs mt-1">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getStatusColor(project.progress)}`}>
                        {getStatusLabel(project.progress)}
                      </span>
                      <button
                        onClick={() => startEdit(project)}
                        className="text-gray-400 hover:text-white p-1 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-400 hover:text-[#ff6b6b] p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {project.deadline && (
                    <div className="text-xs text-gray-500">
                      Deadline: <span className="text-gray-300">{new Date(project.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-[#ffffff10] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${project.progress}%`,
                          background: project.progress >= 80 ? '#51cf66' : project.progress >= 40 ? '#a78bfa' : '#ff6b6b',
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

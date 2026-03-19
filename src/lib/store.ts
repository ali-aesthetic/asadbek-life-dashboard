import { create } from 'zustand'

export type BookStatus = 'not_started' | 'in_progress' | 'completed'

export interface Book {
  id: string
  title: string
  author: string
  status: BookStatus
  currentPage: number
  totalPages: number
  notes: string
  rating: number
}

export interface Assignment {
  id: string
  title: string
  dueDate: string
  completed: boolean
}

export interface Course {
  id: string
  name: string
  instructor: string
  progress: number
  notes: string
  assignments: Assignment[]
}

export interface Project {
  id: string
  name: string
  description: string
  deadline: string
  progress: number
}

export interface MoodEntry {
  date: string
  value: number
}

export interface WeeklyLog {
  weekStart: string
  gymDays: string[]
  moodEntries: MoodEntry[]
  pagesRead: number
  mealPrepDone: boolean
}

export interface WeeklyReview {
  weekStart: string
  whatWentWell: string
  whatToImprove: string
  gymCount: number
  pagesRead: number
  mealPrepDone: boolean
}

interface DashboardStore {
  books: Book[]
  courses: Course[]
  projects: Project[]
  weeklyLogs: WeeklyLog[]
  weeklyReviews: WeeklyReview[]
  currentWeekLog: WeeklyLog

  // Book actions
  updateBook: (id: string, updates: Partial<Book>) => void

  // Course actions
  updateCourse: (id: string, updates: Partial<Course>) => void
  addAssignment: (courseId: string, assignment: Assignment) => void
  toggleAssignment: (courseId: string, assignmentId: string) => void
  removeAssignment: (courseId: string, assignmentId: string) => void

  // Project actions
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void

  // Weekly log actions
  logGym: (day: string) => void
  logMood: (value: number) => void
  addPages: (pages: number) => void
  toggleMealPrep: () => void

  // Weekly review
  updateWeeklyReview: (updates: Partial<WeeklyReview>) => void

  // Hydration
  hydrate: () => void
}

const defaultBooks: Book[] = [
  { id: '1', title: 'The Old Man and the Sea', author: 'Hemingway', status: 'not_started', currentPage: 0, totalPages: 127, notes: '', rating: 0 },
  { id: '2', title: 'Атлант расправил плечи', author: 'Ayn Rand', status: 'not_started', currentPage: 0, totalPages: 1168, notes: '', rating: 0 },
  { id: '3', title: 'The Burnout Society', author: 'Byung-Chul Han', status: 'not_started', currentPage: 0, totalPages: 112, notes: '', rating: 0 },
  { id: '4', title: "Don't Believe Everything You Think", author: 'Joseph Nguyen', status: 'not_started', currentPage: 0, totalPages: 148, notes: '', rating: 0 },
  { id: '5', title: "Can't Hurt Me", author: 'David Goggins', status: 'not_started', currentPage: 0, totalPages: 364, notes: '', rating: 0 },
  { id: '6', title: "Snoopy's Philosophy", author: 'Charles M. Schulz', status: 'not_started', currentPage: 0, totalPages: 96, notes: '', rating: 0 },
  { id: '7', title: 'The 22 Immutable Laws of Marketing', author: 'Al Ries & Jack Trout', status: 'not_started', currentPage: 0, totalPages: 143, notes: '', rating: 0 },
  { id: '8', title: 'The Clash of Civilizations', author: 'Samuel Huntington', status: 'not_started', currentPage: 0, totalPages: 368, notes: '', rating: 0 },
  { id: '9', title: 'The Wealth of Nations', author: 'Adam Smith', status: 'not_started', currentPage: 0, totalPages: 1264, notes: '', rating: 0 },
  { id: '10', title: 'The Republic', author: 'Plato', status: 'not_started', currentPage: 0, totalPages: 416, notes: '', rating: 0 },
  { id: '11', title: 'Психология Народов и Масс', author: 'Gustave Le Bon', status: 'not_started', currentPage: 0, totalPages: 320, notes: '', rating: 0 },
]

const defaultCourses: Course[] = [
  { id: 'cis', name: 'CIS', instructor: 'Isroilov', progress: 0, notes: '', assignments: [] },
  { id: 'ca', name: 'CA', instructor: 'Debasis', progress: 0, notes: '', assignments: [] },
  { id: 'pl', name: 'PL', instructor: 'Nitin', progress: 0, notes: '', assignments: [] },
  { id: 'ds2', name: 'DS2', instructor: 'Debasis', progress: 0, notes: '', assignments: [] },
  { id: 'edit', name: 'Edit & Color', instructor: '', progress: 0, notes: '', assignments: [] },
]

const defaultProjects: Project[] = [
  { id: 'hackathon', name: 'CAU Hackathon', description: 'University hackathon project', deadline: '2026-04-30', progress: 0 },
  { id: 'remotion', name: 'Remotion Video App', description: 'Video application built with Remotion', deadline: '2026-05-31', progress: 0 },
]

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function createDefaultWeeklyLog(): WeeklyLog {
  return {
    weekStart: getWeekStart(new Date()),
    gymDays: [],
    moodEntries: [],
    pagesRead: 0,
    mealPrepDone: false,
  }
}

function createDefaultReview(): WeeklyReview {
  return {
    weekStart: getWeekStart(new Date()),
    whatWentWell: '',
    whatToImprove: '',
    gymCount: 0,
    pagesRead: 0,
    mealPrepDone: false,
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored) as T
  } catch {
    // ignore
  }
  return defaultValue
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  books: defaultBooks,
  courses: defaultCourses,
  projects: defaultProjects,
  weeklyLogs: [],
  weeklyReviews: [],
  currentWeekLog: createDefaultWeeklyLog(),

  hydrate: () => {
    const books = loadFromStorage('books', defaultBooks)
    const courses = loadFromStorage('courses', defaultCourses)
    const projects = loadFromStorage('projects', defaultProjects)
    const weeklyLogs = loadFromStorage<WeeklyLog[]>('weeklyLogs', [])
    const weeklyReviews = loadFromStorage<WeeklyReview[]>('weeklyReviews', [])
    const weekStart = getWeekStart(new Date())
    const currentWeekLog = weeklyLogs.find(l => l.weekStart === weekStart) || createDefaultWeeklyLog()
    set({ books, courses, projects, weeklyLogs, weeklyReviews, currentWeekLog })
  },

  updateBook: (id, updates) => {
    const books = get().books.map(b => b.id === id ? { ...b, ...updates } : b)
    set({ books })
    saveToStorage('books', books)
  },

  updateCourse: (id, updates) => {
    const courses = get().courses.map(c => c.id === id ? { ...c, ...updates } : c)
    set({ courses })
    saveToStorage('courses', courses)
  },

  addAssignment: (courseId, assignment) => {
    const courses = get().courses.map(c =>
      c.id === courseId ? { ...c, assignments: [...c.assignments, assignment] } : c
    )
    set({ courses })
    saveToStorage('courses', courses)
  },

  toggleAssignment: (courseId, assignmentId) => {
    const courses = get().courses.map(c =>
      c.id === courseId
        ? {
            ...c,
            assignments: c.assignments.map(a =>
              a.id === assignmentId ? { ...a, completed: !a.completed } : a
            ),
          }
        : c
    )
    set({ courses })
    saveToStorage('courses', courses)
  },

  removeAssignment: (courseId, assignmentId) => {
    const courses = get().courses.map(c =>
      c.id === courseId
        ? { ...c, assignments: c.assignments.filter(a => a.id !== assignmentId) }
        : c
    )
    set({ courses })
    saveToStorage('courses', courses)
  },

  addProject: (project) => {
    const projects = [...get().projects, project]
    set({ projects })
    saveToStorage('projects', projects)
  },

  updateProject: (id, updates) => {
    const projects = get().projects.map(p => p.id === id ? { ...p, ...updates } : p)
    set({ projects })
    saveToStorage('projects', projects)
  },

  removeProject: (id) => {
    const projects = get().projects.filter(p => p.id !== id)
    set({ projects })
    saveToStorage('projects', projects)
  },

  logGym: (day) => {
    const log = get().currentWeekLog
    const gymDays = log.gymDays.includes(day)
      ? log.gymDays.filter(d => d !== day)
      : [...log.gymDays, day]
    const updated = { ...log, gymDays }
    const weeklyLogs = get().weeklyLogs.filter(l => l.weekStart !== log.weekStart)
    const newLogs = [...weeklyLogs, updated]
    set({ currentWeekLog: updated, weeklyLogs: newLogs })
    saveToStorage('weeklyLogs', newLogs)
  },

  logMood: (value) => {
    const log = get().currentWeekLog
    const today = new Date().toISOString().split('T')[0]
    const moodEntries = [
      ...log.moodEntries.filter(e => e.date !== today),
      { date: today, value },
    ]
    const updated = { ...log, moodEntries }
    const weeklyLogs = get().weeklyLogs.filter(l => l.weekStart !== log.weekStart)
    const newLogs = [...weeklyLogs, updated]
    set({ currentWeekLog: updated, weeklyLogs: newLogs })
    saveToStorage('weeklyLogs', newLogs)
  },

  addPages: (pages) => {
    const log = get().currentWeekLog
    const updated = { ...log, pagesRead: log.pagesRead + pages }
    const weeklyLogs = get().weeklyLogs.filter(l => l.weekStart !== log.weekStart)
    const newLogs = [...weeklyLogs, updated]
    set({ currentWeekLog: updated, weeklyLogs: newLogs })
    saveToStorage('weeklyLogs', newLogs)
  },

  toggleMealPrep: () => {
    const log = get().currentWeekLog
    const updated = { ...log, mealPrepDone: !log.mealPrepDone }
    const weeklyLogs = get().weeklyLogs.filter(l => l.weekStart !== log.weekStart)
    const newLogs = [...weeklyLogs, updated]
    set({ currentWeekLog: updated, weeklyLogs: newLogs })
    saveToStorage('weeklyLogs', newLogs)
  },

  updateWeeklyReview: (updates) => {
    const weekStart = getWeekStart(new Date())
    const existing = get().weeklyReviews.find(r => r.weekStart === weekStart) || createDefaultReview()
    const updated = { ...existing, ...updates }
    const reviews = [
      ...get().weeklyReviews.filter(r => r.weekStart !== weekStart),
      updated,
    ]
    set({ weeklyReviews: reviews })
    saveToStorage('weeklyReviews', reviews)
  },
}))

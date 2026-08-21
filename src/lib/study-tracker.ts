export type StudyRecord = {
  id: string
  title: string
  subject?: string
  lastOpenedAt: number
  progress: number
  bookmarked: boolean
}

const KEY = 'yaza-study-tracker-v1'

function read(): StudyRecord[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as StudyRecord[] } catch { return [] }
}

function write(items: StudyRecord[]) { localStorage.setItem(KEY, JSON.stringify(items)) }

export function getStudyRecords() { return read().sort((a, b) => b.lastOpenedAt - a.lastOpenedAt) }

export function recordStudyOpen(material: Pick<StudyRecord, 'id' | 'title' | 'subject'>) {
  const items = read()
  const existing = items.find(item => item.id === material.id)
  const next = existing
    ? { ...existing, ...material, lastOpenedAt: Date.now() }
    : { ...material, lastOpenedAt: Date.now(), progress: 0, bookmarked: false }
  write([next, ...items.filter(item => item.id !== material.id)])
}

export function setStudyProgress(id: string, progress: number) {
  write(read().map(item => item.id === id ? { ...item, progress: Math.max(0, Math.min(100, progress)), lastOpenedAt: Date.now() } : item))
}

export function toggleBookmark(id: string) {
  write(read().map(item => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
}

export function isBookmarked(id: string) { return read().find(item => item.id === id)?.bookmarked ?? false }

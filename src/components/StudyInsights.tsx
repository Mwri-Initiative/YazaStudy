'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Clock3, History, ArrowRight } from 'lucide-react'
import { getStudyRecords, type StudyRecord } from '../lib/study-tracker'

export default function StudyInsights() {
  const [records, setRecords] = useState<StudyRecord[]>([])
  useEffect(() => setRecords(getStudyRecords()), [])
  const recent = records.slice(0, 3)
  const bookmarks = records.filter(item => item.bookmarked).slice(0, 3)
  if (!recent.length && !bookmarks.length) return null

  const Item = ({ item }: { item: StudyRecord }) => (
    <Link href={`/my-materials?focus=${encodeURIComponent(item.id)}`} className="group block rounded-2xl border border-white/8 bg-white/[.025] p-4 hover:border-primary/25 hover:bg-primary/5 smooth-transition">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.subject || 'Study material'}</p><p className="mt-1 line-clamp-2 text-sm font-bold text-text group-hover:text-primary">{item.title}</p></div>{item.bookmarked && <Bookmark className="h-4 w-4 shrink-0 fill-current text-secondary" />}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} /></div>
      <p className="mt-2 text-[10px] font-semibold text-text-muted">{item.progress}% complete</p>
    </Link>
  )

  return <section className="mb-8 grid gap-4 lg:grid-cols-2"><div className="glass rounded-3xl border border-white/10 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-extrabold text-text"><History className="h-4 w-4 text-primary" /> Continue studying</h2><Clock3 className="h-4 w-4 text-text-muted" /></div><div className="grid gap-2.5">{recent.map(item => <Item key={item.id} item={item} />)}</div></div>{bookmarks.length > 0 && <div className="glass rounded-3xl border border-white/10 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-extrabold text-text"><Bookmark className="h-4 w-4 text-secondary" /> Bookmarked</h2><Link href="/my-materials" className="text-xs font-bold text-primary">View all <ArrowRight className="ml-1 inline h-3 w-3" /></Link></div><div className="grid gap-2.5">{bookmarks.map(item => <Item key={item.id} item={item} />)}</div></div>}</section>
}

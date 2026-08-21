'use client'

import { X, Download, ExternalLink, Bookmark, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { isBookmarked, setStudyProgress, toggleBookmark } from '../lib/study-tracker'

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  pdfUrl: string
  materialId?: string
}

export default function PdfViewerModal({ isOpen, onClose, title, pdfUrl, materialId }: PdfViewerModalProps) {
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    if (materialId) {
      setBookmarked(isBookmarked(materialId))
      setStudyProgress(materialId, 25)
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, materialId])

  if (!isOpen) return null

  const close = () => {
    if (materialId) setStudyProgress(materialId, 100)
    document.body.style.overflow = 'unset'
    onClose()
  }

  const bookmark = () => {
    if (!materialId) return
    toggleBookmark(materialId)
    setBookmarked(v => !v)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={close} />
      <div className="relative w-full max-w-6xl h-full max-h-[94vh] glass rounded-[24px] sm:rounded-[32px] border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-white/5">
          <div className="flex min-w-0 items-center gap-3"><div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/20 items-center justify-center"><span className="text-xl font-display">📄</span></div><div className="min-w-0"><h3 className="text-sm sm:text-lg font-bold text-text line-clamp-1">{title}</h3><p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-widest font-bold">Study Material</p></div></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {materialId && <Button variant="outline" size="sm" onClick={bookmark} className={`hidden sm:inline-flex glass border-white/10 ${bookmarked ? 'text-secondary' : 'text-text'}`}><Bookmark className={`mr-2 h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} /> {bookmarked ? 'Bookmarked' : 'Bookmark'}</Button>}
            <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')} className="hidden sm:flex glass border-white/10 text-text hover:bg-white/5"><ExternalLink className="h-4 w-4 mr-2" /> Open Full</Button>
            <button onClick={close} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 text-text-muted hover:text-text smooth-transition" aria-label="Close viewer"><X className="h-6 w-6" /></button>
          </div>
        </div>
        <div className="flex-1 bg-[#1a1a1a] relative"><iframe src={`${pdfUrl}#toolbar=1&view=FitH`} className="w-full h-full border-none" title={title} /></div>
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-xs text-text-muted italic truncate">Viewing premium study material</p>{materialId && <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-primary"><CheckCircle2 className="h-3 w-3" /> Study session active</p>}</div>
          <div className="flex gap-2"><Button variant="outline" onClick={close} className="rounded-xl border-white/10">Done</Button><Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl" onClick={() => window.open(pdfUrl, '_blank')}><Download className="h-4 w-4 mr-2" /> Download</Button></div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { X, Download, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { useEffect } from 'react'

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  pdfUrl: string
}

export default function PdfViewerModal({ isOpen, onClose, title, pdfUrl }: PdfViewerModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] glass rounded-[32px] border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-xl font-display">📄</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text line-clamp-1">{title}</h3>
              <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Study Material</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(pdfUrl, '_blank')}
              className="hidden sm:flex glass border-white/10 text-text hover:bg-white/5"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full
            </Button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 text-text-muted hover:text-text smooth-transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#1a1a1a] relative">
          <iframe 
            src={`${pdfUrl}#toolbar=1&view=FitH`} 
            className="w-full h-full border-none"
            title={title}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-text-muted italic">
            Viewing premium study material
          </p>
          <div className="flex gap-3">
             <Button
                className="bg-primary hover:bg-primary/90 text-white font-bold"
                onClick={() => {
                    window.open(pdfUrl, '_blank');
                }}
            >
                <Download className="h-4 w-4 mr-2" />
                Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

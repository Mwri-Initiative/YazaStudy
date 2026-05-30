"use client"

import React, { useRef, useState, forwardRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Volume2, VolumeX, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  variant?: 'notice'
}
interface MessageItemProps {
  message: Message
  index: number
  speakText: (text: string, i: number) => void
  renderMessageContent: (content: string) => React.ReactNode
  speakingId: number | null
}

export default function MessageItem({
  message,
  index,
  speakText,
  renderMessageContent,
  speakingId,
}: MessageItemProps) {
  const pressTimer = useRef<number | null>(null)
  const [copied, setCopied] = useState(false)

  const startPress = () => {
    // long-press (500ms) to copy
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => doCopy(), 500)
  }
  const cancelPress = () => {
    if (pressTimer.current) { window.clearTimeout(pressTimer.current); pressTimer.current = null }
  }

  const doCopy = async () => {
    try {
      if (navigator.clipboard && message.content) {
        await navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }
    } catch (err) {
      console.error('copy failed', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-3 max-w-[94%] md:max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md border overflow-hidden ${message.role === 'user' ? 'bg-[#151515] border-white/10' : 'bg-white border-white/10'}`}>
          {message.role === 'user' ? <User className="h-5 w-5 text-text-muted" /> : <Image src="/mwiri-logo.svg" alt="Mwiri" width={36} height={36} className="object-cover" />}
        </div>

        <div className="relative group">
          <div
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onContextMenu={(e) => { e.preventDefault(); doCopy() }}
            className={`px-4 py-3 md:px-5 md:py-4 rounded-2xl md:rounded-[24px] text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-white/5 border border-white/10 text-white rounded-tr-none shadow-md'
                : message.variant === 'notice'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-100/90 rounded-tl-none'
                  : 'bg-[#121215] border border-white/5 text-text-secondary rounded-tl-none'
            }`}
          >
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              renderMessageContent(message.content)
            )}
          </div>

          {message.role === 'assistant' && message.variant !== 'notice' && (
            <div className="absolute right-2 -bottom-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 z-20 bg-black/60 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => speakText(message.content, index)}
                className="p-1 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                title={speakingId === index ? 'Stop speaking' : 'Read aloud'}
              >
                {speakingId === index ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {copied && (
            <div className="absolute top-0 right-0 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md">Copied</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

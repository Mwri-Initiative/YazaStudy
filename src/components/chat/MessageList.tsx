"use client"

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import MessageItem from './MessageItem'

interface Message {
  role: 'user' | 'assistant'
  content: string
  variant?: 'notice'
}

export default function MessageList({
  messages,
  isLoading,
  renderMessageContent,
  speakText,
  speakingId,
}: {
  messages: Message[]
  isLoading: boolean
  renderMessageContent: (c: string) => React.ReactNode
  speakText: (t: string, i: number) => void
  speakingId: number | null
}) {
  return (
    <AnimatePresence mode="popLayout">
      {messages.map((m, i) => (
        <MessageItem
          key={i}
          message={m}
          index={i}
          speakText={speakText}
          renderMessageContent={renderMessageContent}
          speakingId={speakingId}
        />
      ))}
      {isLoading && (
        <div className="flex justify-start items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-xl flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
            <img src="/mwiri-logo.svg" className="object-cover opacity-60 animate-pulse" alt="" />
          </div>
          <div className="bg-[#121215] px-4 py-2.5 md:py-3.5 rounded-2xl border border-white/5 flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Thinking</span>
            <div className="flex gap-1.5 px-2">
              <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-pulse delay-75" />
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

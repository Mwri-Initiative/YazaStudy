"use client"

import React from 'react'
import { Button } from '../../components/ui/button'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'

export default function ChatInput({
  input,
  setInput,
  handleSend,
  isLoading,
  isListening,
  toggleListening,
  inputRef,
  activeSubject
}: {
  input: string
  setInput: (v: string) => void
  handleSend: (customPrompt?: string) => void
  isLoading: boolean
  isListening: boolean
  toggleListening: () => void
  inputRef: React.RefObject<HTMLInputElement>
  activeSubject: { name: string }
}) {
  return (
    <div className="bg-[#121215] rounded-[24px] md:rounded-[32px] p-2 flex items-center gap-2 border border-white/10 shadow-2xl backdrop-blur-xl relative">
      <input
        type="text"
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onClick={() => inputRef.current?.focus()}
        onFocus={() => inputRef.current?.focus()}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
        placeholder={isListening ? "Listening to your voice..." : `Ask Yaza a ${activeSubject.name} question...`}
        className="flex-1 bg-transparent border-none outline-none px-4 py-3 md:py-4 text-white placeholder:text-text-muted text-sm md:text-base font-medium"
        disabled={false}
        style={{ pointerEvents: 'auto' }}
      />

      <Button
        onClick={toggleListening}
        variant="ghost"
        size="icon"
        className={`w-11 h-11 md:w-12 md:h-12 rounded-full shrink-0 transition-colors ${
          isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-text-muted hover:bg-white/5'
        }`}
        title={isListening ? "Stop listening" : "Dictate question"}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button
        onClick={() => handleSend()}
        disabled={!input.trim() || isLoading}
        className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-all text-white"
        style={{
          backgroundColor: input.trim() && !isLoading ? 'var(--subject-color)' : 'rgba(255,255,255,0.05)',
          color: input.trim() && !isLoading ? '#ffffff' : 'rgba(255,255,255,0.4)',
          boxShadow: input.trim() && !isLoading ? '0 4px 14px var(--subject-color-glow)' : 'none'
        }}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      </Button>
    </div>
  )
}

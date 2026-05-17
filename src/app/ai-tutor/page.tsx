'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Sparkles, Loader2, ArrowLeft, Trash2, BookOpen, GraduationCap, Zap, Info, HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  variant?: 'notice'
}

const QUICK_ACTIONS = [
  { label: 'Math Helper', prompt: 'Can you help me solve a quadratic equation step-by-step?', icon: <Zap className="w-3 h-3 text-yellow-400" /> },
  { label: 'Literature Summary', prompt: 'Give me a summary and key themes of "The Pearl" for MSCE.', icon: <BookOpen className="w-3 h-3 text-blue-400" /> },
  { label: 'Science Quiz', prompt: 'Give me 3 quick multiple choice questions on Photosynthesis.', icon: <Sparkles className="w-3 h-3 text-green-400" /> },
  { label: 'Chichewa Expert', prompt: 'Kodi mungandithandize kumvetsa ndakatulo za m’Chichewa?', icon: <GraduationCap className="w-3 h-3 text-orange-400" /> },
]

const ThinkingDots = () => (
  <div className="flex gap-1.5 px-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
        className="w-1.5 h-1.5 bg-primary rounded-full"
      />
    ))}
  </div>
)

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Zabwino! I am your **Yaza AI Tutor**. I am specialized in the Malawi MSCE syllabus. What are we studying today? You can ask me anything or use the quick buttons below!' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async (customPrompt?: string) => {
    const messageToSend = customPrompt || input.trim()
    if (!messageToSend || isLoading) return

    if (!customPrompt) setInput('')
    
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: messageToSend }]
        })
      })

      const data = await response.json()
      if (response.ok && data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            variant: 'notice',
            content:
              data.error ||
              "Something went wrong while getting your answer. Please try again in a moment.",
          },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          variant: 'notice',
          content:
            "We couldn't reach Yaza AI. Check your internet connection and try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col font-sans selection:bg-primary/30 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Modern Header */}
      <header className="z-50 px-4 py-3 md:px-6 md:py-4 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="text-text-muted hover:bg-white/5 h-9 w-9 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                <Image src="/mwiri-logo.png" alt="Mwiri" width={40} height={40} className="object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-lg font-black text-white truncate flex items-center gap-2">
                  Yaza AI <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] uppercase tracking-tighter">Pro</span>
                </h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-bold text-green-500/80 uppercase tracking-widest">MSCE Expert</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowInfo(true)}
              className="text-text-muted hover:bg-white/5 h-9 w-9 rounded-xl"
            >
              <Info className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMessages([{ role: 'assistant', content: 'Zabwino! I am your **Yaza AI Tutor**. How can I help you with your studies today?' }])} 
              className="text-text-muted hover:bg-red-500/10 h-9 w-9 rounded-xl"
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 md:space-y-8 scroll-smooth custom-scrollbar relative z-10"
      >
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-48">
          <AnimatePresence mode="popLayout">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[92%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md border overflow-hidden ${
                    m.role === 'user' ? 'bg-secondary border-primary/20' : 'bg-white border-white/10'
                  }`}>
                    {m.role === 'user' ? (
                      <User className="h-5 w-5 text-primary" />
                    ) : (
                      <Image src="/mwiri-logo.png" alt="Mwiri" width={36} height={36} className="object-cover" />
                    )}
                  </div>

                  <div className={`relative ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`px-4 py-3 md:px-5 md:py-4 rounded-2xl md:rounded-[24px] text-sm md:text-base leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none shadow-md' 
                        : m.variant === 'notice'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-100/90 rounded-tl-none'
                          : 'bg-[#151515] border border-white/5 text-text-secondary rounded-tl-none'
                    }`}>
                      <div className="markdown-content prose prose-invert prose-sm md:prose-base max-w-none">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex justify-start items-center gap-3"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-xl flex items-center justify-center border border-primary/30 overflow-hidden shrink-0">
                <Image src="/mwiri-logo.png" alt="Mwiri" width={36} height={36} className="object-cover opacity-60 animate-pulse" />
              </div>
              <div className="bg-[#151515] px-4 py-2 md:py-3 rounded-2xl border border-white/5 flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Thinking</span>
                <ThinkingDots />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action/Input Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-4 md:pb-8">
        <div className="max-w-3xl mx-auto px-4">
          
          {/* Quick Action Chips - Hide when chat starts getting long or keep them floating */}
          {messages.length < 5 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
              {QUICK_ACTIONS.map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/5 text-[10px] md:text-xs font-bold text-text-muted whitespace-nowrap hover:bg-[#252525] hover:border-primary/30 transition-all shadow-lg"
                >
                  {action.icon}
                  {action.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Main Input Area */}
          <div className="bg-[#1a1a1a] rounded-[24px] md:rounded-[32px] p-1.5 flex items-center gap-2 border border-white/10 shadow-2xl backdrop-blur-xl relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Yaza a study question..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 md:py-4 text-white placeholder:text-text-muted text-sm md:text-base font-medium"
            />

            <Button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 md:w-13 md:h-13 rounded-full flex items-center justify-center shrink-0 transition-all ${
                input.trim() && !isLoading ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-text-muted'
              }`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#151515] border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image src="/mwiri-logo.png" alt="Mwiri" width={48} height={48} className="object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">About Yaza AI</h2>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">MSCE Education Specialist</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
                <p>
                  Yaza AI is a specialized learning assistant designed specifically for <span className="text-white font-bold">Malawian students</span> preparing for their MSCE exams.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Zap className="w-4 h-4 text-yellow-400 mb-2" />
                    <p className="text-[10px] font-bold text-white uppercase mb-1">Expert Math</p>
                    <p className="text-[10px] leading-tight text-text-muted">Step-by-step solutions for MSCE formulas.</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <BookOpen className="w-4 h-4 text-blue-400 mb-2" />
                    <p className="text-[10px] font-bold text-white uppercase mb-1">Literature</p>
                    <p className="text-[10px] leading-tight text-text-muted">Summaries of prescribed MSCE texts.</p>
                  </div>
                </div>
                <p className="pt-2 italic text-xs text-text-muted">
                  Note: While Yaza is an expert, always cross-reference with your official textbooks and teachers for the final exam guidelines.
                </p>
              </div>

              <Button 
                onClick={() => setShowInfo(false)}
                className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-2xl shadow-xl shadow-primary/20"
              >
                Got it, let's study!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .markdown-content p { margin-bottom: 0.75rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content strong { color: white; font-weight: 700; }
        .markdown-content code { background: rgba(255,255,255,0.05); padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.9em; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

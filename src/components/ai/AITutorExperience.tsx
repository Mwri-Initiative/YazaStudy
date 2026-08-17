'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Brain, ChevronRight, GraduationCap, Lightbulb, Loader2, MessageCircleQuestion, Mic, MicOff, RotateCcw, Send, Sparkles, Target, Volume2, VolumeX, X, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { useAuth } from '../../lib/auth-context'

type Role = 'user' | 'assistant'
type Message = { role: Role; content: string }
type Subject = { id: string; name: string; icon: string; color: string }
type Mode = { id: 'teach' | 'practice' | 'revision' | 'quiz'; label: string; description: string; icon: React.ReactNode }
type QuizData = { question: string; options: string[]; correctIndex: number; explanation: string }

const SUBJECTS: Subject[] = [
  { id: 'all', name: 'All subjects', icon: '🎓', color: '#22c55e' },
  { id: 'mathematics', name: 'Mathematics', icon: '∑', color: '#3b82f6' },
  { id: 'physics', name: 'Physics', icon: '⚛', color: '#14b8a6' },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗', color: '#eab308' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: '#22c55e' },
  { id: 'english', name: 'English', icon: '📝', color: '#a855f7' },
  { id: 'chichewa', name: 'Chichewa', icon: '📖', color: '#f97316' },
]

const MODES: Mode[] = [
  { id: 'teach', label: 'Teach me', description: 'Learn from the basics with examples', icon: <Brain className="h-4 w-4" /> },
  { id: 'practice', label: 'Practice', description: 'Try a question with coaching', icon: <Target className="h-4 w-4" /> },
  { id: 'revision', label: 'Revision', description: 'Compress a topic for exam review', icon: <Zap className="h-4 w-4" /> },
  { id: 'quiz', label: 'Quiz me', description: 'Test yourself one question at a time', icon: <MessageCircleQuestion className="h-4 w-4" /> },
]

const QUICK_ACTIONS = [
  { label: 'Explain a topic', icon: <Lightbulb className="h-4 w-4" />, prompt: 'Teach me a topic from the selected subject. Start by asking what I already know, then teach it clearly.' },
  { label: 'Give me a hint', icon: <Target className="h-4 w-4" />, prompt: 'Give me a hint for the last problem without revealing the final answer. Help me think it out.' },
  { label: 'Explain again', icon: <RotateCcw className="h-4 w-4" />, prompt: 'Explain your last teaching point again in a simpler way, using a different example and fewer technical words.' },
  { label: 'Practice this', icon: <GraduationCap className="h-4 w-4" />, prompt: 'Give me one practice question based on what we just learned. Do not reveal the answer until I try.' },
]

function getWelcome(subject: Subject) {
  const name = subject.id === 'all' ? 'your MSCE subjects' : subject.name
  return `**Welcome to Yaza AI Tutor.** 👋\n\nI’m here to help you *learn*, not just collect answers. We’ll work through **${name}** using simple explanations, examples, guided practice and quick checks for understanding.\n\nPick a learning mode above or tell me what you are studying. **What do you already know about the topic?**`
}

function parseQuiz(content: string): { before: string; quiz: QuizData | null; after: string } {
  const match = content.match(/```yaza-quiz\s*([\s\S]*?)\s*```/)
  if (!match) return { before: content, quiz: null, after: '' }
  try {
    return { before: content.slice(0, match.index), quiz: JSON.parse(match[1].trim()), after: content.slice((match.index || 0) + match[0].length) }
  } catch {
    return { before: content, quiz: null, after: '' }
  }
}

function QuizCard({ quiz, onLearn }: { quiz: QuizData; onLearn: (prompt: string) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = selected === quiz.correctIndex
  return (
    <div className="mt-4 rounded-3xl border border-primary/20 bg-primary/[.045] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">Quick check</span>
        {checked && <span className={`text-xs font-bold ${correct ? 'text-emerald-400' : 'text-amber-400'}`}>{correct ? 'Correct 🎉' : 'Keep learning'}</span>}
      </div>
      <h3 className="mt-4 text-base font-extrabold leading-6 text-text sm:text-lg">{quiz.question}</h3>
      <div className="mt-4 grid gap-2">
        {quiz.options.map((option, index) => {
          const chosen = selected === index
          const right = checked && index === quiz.correctIndex
          const wrong = checked && chosen && !right
          return <button key={option} onClick={() => !checked && setSelected(index)} className={`flex min-h-12 items-center gap-3 rounded-2xl border px-3 text-left text-sm font-semibold smooth-transition ${right ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : wrong ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : chosen ? 'border-primary/60 bg-primary/10 text-text' : 'border-white/8 bg-white/[.03] text-text-secondary hover:border-white/15 hover:bg-white/[.06]'}`}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black">{String.fromCharCode(65 + index)}</span><span>{option}</span>
          </button>
        })}
      </div>
      {!checked ? <Button disabled={selected === null} onClick={() => setChecked(true)} className="mt-4 min-h-11 w-full rounded-2xl bg-primary font-bold text-white disabled:opacity-40">Check my answer</Button> : (
        <div className="mt-4 rounded-2xl border border-white/8 bg-black/10 p-3.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Why</p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{quiz.explanation}</p>
          <button onClick={() => onLearn('Teach me the concept behind this question. Explain why the correct answer is correct, then give me a similar example to try.')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">Learn from this question <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  )
}

export default function AITutorExperience() {
  const router = useRouter()
  const { user } = useAuth()
  const [subject, setSubject] = useState('all')
  const [mode, setMode] = useState<Mode['id']>('teach')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeSubject = useMemo(() => SUBJECTS.find(item => item.id === subject) || SUBJECTS[0], [subject])
  const storageKey = `yaza_ai_teach_${subject}_${mode}`

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try { setMessages(JSON.parse(saved)) } catch { setMessages([{ role: 'assistant', content: getWelcome(activeSubject) }]) }
    } else setMessages([{ role: 'assistant', content: getWelcome(activeSubject) }])
    window.speechSynthesis?.cancel()
    setSpeakingIndex(null)
  }, [storageKey, activeSubject])

  useEffect(() => { if (messages.length) localStorage.setItem(storageKey, JSON.stringify(messages)) }, [messages, storageKey])
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages, loading])

  const send = async (custom?: string) => {
    const text = (custom ?? input).trim()
    if (!text || loading) return
    setInput('')
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setLoading(true)
    try {
      const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next, subject, learningMode: mode }) })
      const data = await response.json()
      if (!response.ok || !data.content) throw new Error(data.error || 'AI unavailable')
      setMessages([...next, { role: 'assistant', content: data.content }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `I couldn't connect right now. ${error instanceof Error ? error.message : 'Please try again.'}` }])
    } finally { setLoading(false) }
  }

  const startVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return alert('Voice input is not supported in this browser. Try Chrome.')
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onresult = (event: any) => setInput(prev => `${prev}${prev ? ' ' : ''}${event.results[0][0].transcript}`)
    recognition.onerror = () => setListening(false); recognition.onend = () => setListening(false)
    recognitionRef.current = recognition; recognition.start()
  }

  const speak = (text: string, index: number) => {
    if (!window.speechSynthesis) return
    if (speakingIndex === index) { window.speechSynthesis.cancel(); setSpeakingIndex(null); return }
    window.speechSynthesis.cancel()
    const clean = text.replace(/```yaza-quiz[\s\S]*?```/g, 'There is an interactive question on the screen.').replace(/[*#_`~]/g, '')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.onend = () => setSpeakingIndex(null); utterance.onerror = () => setSpeakingIndex(null)
    setSpeakingIndex(index); window.speechSynthesis.speak(utterance)
  }

  const reset = () => {
    const welcome = [{ role: 'assistant' as const, content: getWelcome(activeSubject) }]
    setMessages(welcome); localStorage.setItem(storageKey, JSON.stringify(welcome))
  }

  const renderContent = (content: string, index: number) => {
    const parsed = parseQuiz(content)
    return <>
      {parsed.before && <div className="prose prose-invert prose-sm max-w-none leading-7 text-text-secondary sm:prose-base"><ReactMarkdown>{parsed.before}</ReactMarkdown></div>}
      {parsed.quiz && <QuizCard quiz={parsed.quiz} onLearn={send} />}
      {parsed.after && <div className="prose prose-invert prose-sm mt-4 max-w-none leading-7 text-text-secondary sm:prose-base"><ReactMarkdown>{parsed.after}</ReactMarkdown></div>}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button onClick={() => speak(content, index)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-bold text-text-muted hover:bg-white/5 hover:text-text">{speakingIndex === index ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}{speakingIndex === index ? 'Stop' : 'Listen'}</button>
        <button onClick={() => send('Explain your last response again more simply, using a different example. Then ask me one short question to check if I understand.')} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-bold text-text-muted hover:bg-white/5 hover:text-text"><RotateCcw className="h-3.5 w-3.5" /> Explain again</button>
        <button onClick={() => send('Give me one hint about the last concept without giving away the answer.')} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-bold text-text-muted hover:bg-white/5 hover:text-text"><Lightbulb className="h-3.5 w-3.5" /> Hint</button>
      </div>
    </>
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] overflow-hidden" style={{ ['--ai-accent' as any]: activeSubject.color }}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"><div className="absolute -left-24 top-20 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${activeSubject.color}12` }} /><div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-primary/8 blur-3xl" /></div>

      <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 px-3 py-2.5 backdrop-blur-xl sm:px-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0 rounded-xl text-text-muted"><ArrowLeft className="h-4 w-4" /></Button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Brain className="h-5 w-5" /></div>
            <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-sm font-black text-text sm:text-base">Yaza AI Tutor</h1><span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary sm:inline-flex">Learning Coach</span></div><p className="truncate text-[10px] font-semibold text-text-muted">{user?.name ? `Learning with ${user.name.split(' ')[0]}` : 'Teach • Practice • Master'}</p></div>
          </div>
          <div className="flex items-center gap-1"><button onClick={() => setShowInfo(true)} className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold text-text-muted hover:bg-white/5 hover:text-text"><Sparkles className="h-4 w-4 text-primary" /><span className="hidden sm:inline">How it teaches</span></button><button onClick={reset} className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted hover:bg-red-500/10 hover:text-red-400" aria-label="Reset chat"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-3 pb-3 pt-4 sm:px-5 sm:pt-6">
        <div className="rounded-[26px] border border-white/8 bg-white/[.025] p-3 shadow-xl sm:rounded-[30px] sm:p-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">{SUBJECTS.map(item => <button key={item.id} onClick={() => setSubject(item.id)} className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-2xl border px-3 text-xs font-extrabold smooth-transition ${subject === item.id ? 'border-transparent text-white shadow-lg' : 'border-white/8 bg-white/[.02] text-text-muted hover:text-text'}`} style={subject === item.id ? { backgroundColor: item.color, boxShadow: `0 8px 20px ${item.color}28` } : undefined}>{item.icon} {item.name}</button>)}</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">{MODES.map(item => <button key={item.id} onClick={() => setMode(item.id)} className={`flex min-h-[68px] items-center gap-3 rounded-2xl border p-3 text-left smooth-transition ${mode === item.id ? 'border-primary/25 bg-primary/10' : 'border-white/6 bg-white/[.02] hover:bg-white/[.05]'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mode === item.id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'}`}>{item.icon}</span><span className="min-w-0"><span className="block text-xs font-extrabold text-text">{item.label}</span><span className="mt-0.5 block truncate text-[10px] text-text-muted">{item.description}</span></span></button>)}</div>
        </div>
      </section>

      <section ref={scrollRef} className="mx-auto flex max-w-5xl flex-col px-3 pb-44 pt-3 sm:px-5 sm:pt-5">
        {messages.length === 1 && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-[26px] border border-primary/15 bg-gradient-to-br from-primary/10 to-transparent p-5 sm:p-7"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><GraduationCap className="h-6 w-6" /></div><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Your learning coach</p><h2 className="mt-1 text-2xl font-black tracking-tight text-text sm:text-3xl">Let&apos;s understand it, not just memorize it.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Yaza can break a topic down, show a worked example, check your understanding, give hints, and then help you practise it.</p></div></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{QUICK_ACTIONS.map(action => <button key={action.label} onClick={() => send(action.prompt)} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[.03] px-3 text-left text-[11px] font-bold text-text-secondary hover:border-primary/20 hover:bg-primary/5 hover:text-text"><span className="text-primary">{action.icon}</span>{action.label}</button>)}</div></motion.div>}

        <div className="space-y-5"><AnimatePresence initial={false}>{messages.map((message, index) => <motion.div key={`${index}-${message.role}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`${message.role === 'user' ? 'max-w-[88%] rounded-[24px] rounded-br-md bg-primary px-4 py-3 text-white shadow-lg shadow-primary/10 sm:max-w-[75%]' : 'w-full max-w-3xl rounded-[26px] border border-white/8 bg-white/[.025] px-4 py-4 sm:px-5'}`}>{message.role === 'assistant' ? <><div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Brain className="h-3.5 w-3.5" /></span><span className="text-[10px] font-black uppercase tracking-widest text-primary">Yaza Tutor</span></div>{renderContent(message.content, index)}</> : <p className="text-sm leading-6 font-medium">{message.content}</p>}</div></motion.div>)}</AnimatePresence>{loading && <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.025] px-4 py-3 text-sm text-text-muted"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Brain className="h-3.5 w-3.5" /></span><span>Yaza is thinking about the best way to teach this…</span><Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" /></div>}</div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-background/90 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl sm:px-5 sm:pb-4"><div className="mx-auto max-w-5xl"><div className="mb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">{QUICK_ACTIONS.slice(0, 3).map(action => <button key={action.label} onClick={() => send(action.prompt)} disabled={loading} className="flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/8 bg-white/[.03] px-3 text-[10px] font-bold text-text-muted hover:border-primary/20 hover:text-text disabled:opacity-50">{action.icon}{action.label}</button>)}</div><div className="flex items-center gap-2 rounded-[22px] border border-white/10 bg-white/[.04] p-1.5 shadow-2xl focus-within:border-primary/30"><input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }} placeholder={listening ? 'Listening…' : `Ask Yaza to teach you ${activeSubject.id === 'all' ? 'anything' : activeSubject.name}…`} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-medium text-text outline-none placeholder:text-text-muted" /><button onClick={startVoice} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${listening ? 'bg-red-500/15 text-red-400' : 'text-text-muted hover:bg-white/5 hover:text-text'}`} aria-label="Voice input">{listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}</button><button onClick={() => send()} disabled={!input.trim() || loading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 disabled:bg-white/5 disabled:text-text-muted disabled:shadow-none" aria-label="Send"><Send className="h-5 w-5" /></button></div><p className="mt-1.5 hidden text-center text-[9px] font-semibold text-text-muted sm:block">Tip: ask “why?”, “show me another example”, or “quiz me” to keep learning.</p></div></div>

      <AnimatePresence>{showInfo && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><motion.button aria-label="Close" onClick={() => setShowInfo(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" /><motion.div initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .97 }} className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-[28px] border border-white/10 bg-background p-6 shadow-2xl sm:p-7"><button onClick={() => setShowInfo(false)} className="absolute right-4 top-4 rounded-xl p-2 text-text-muted hover:bg-white/5"><X className="h-4 w-4" /></button><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Brain className="h-6 w-6" /></div><h2 className="mt-5 text-2xl font-black text-text">How Yaza teaches</h2><p className="mt-2 text-sm leading-6 text-text-muted">The goal is understanding. Yaza is instructed to adapt explanations to the learner, use examples, check understanding and move from explanation to practice.</p><div className="mt-5 grid gap-2">{['Diagnose what you know', 'Explain in simple layers', 'Show a worked example', 'Ask you to think or try', 'Give hints before answers', 'Turn mistakes into another learning opportunity'].map((item, i) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">{i + 1}</span><span className="text-sm font-semibold text-text-secondary">{item}</span></div>)}</div><Button onClick={() => setShowInfo(false)} className="mt-6 min-h-12 w-full rounded-2xl bg-primary font-bold text-white">Start learning</Button></motion.div></div>}</AnimatePresence>
    </main>
  )
}

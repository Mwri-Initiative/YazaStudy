'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  User, 
  Sparkles, 
  Loader2, 
  ArrowLeft, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Zap, 
  Info, 
  X, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  RotateCcw,
  BookMarked,
  Radio,
  CheckCircle2
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import MessageItem from '../../components/chat/MessageItem'
import MessageList from '../../components/chat/MessageList'
import ChatInput from '../../components/chat/ChatInput'
import confetti from 'canvas-confetti'

interface Message {
  role: 'user' | 'assistant'
  content: string
  variant?: 'notice'
}

interface QuizData {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const SUBJECTS = [
  { id: 'all', name: 'General', color: '#6366f1', icon: '🎓' },
  { id: 'mathematics', name: 'Mathematics', color: '#2196F3', icon: '∑' },
  { id: 'physics', name: 'Physics', color: '#2E8B57', icon: '⚛' },
  { id: 'chemistry', name: 'Chemistry', color: '#FFC107', icon: '⚗' },
  { id: 'biology', name: 'Biology', color: '#4CAF50', icon: '🧬' },
  { id: 'english', name: 'English', color: '#9C27B0', icon: '📝' },
  { id: 'chichewa', name: 'Chichewa', color: '#FF5722', icon: '📖' },
]

const MODES = [
  { id: 'explain', label: 'Concept Explainer', icon: <BookMarked className="w-3.5 h-3.5" />, desc: 'Simple explanations with local examples' },
  { id: 'revision', label: 'Exam Revision', icon: <Zap className="w-3.5 h-3.5" />, desc: 'Summaries, key tips, and test questions' },
  { id: 'quiz', label: 'Interactive Quiz', icon: <Sparkles className="w-3.5 h-3.5" />, desc: 'Multiple-choice test cards with explanations' }
]

const QUICK_ACTIONS: Record<string, { label: string; prompt: string; icon: any }[]> = {
  all: [
    { label: 'Study Tips', prompt: 'Give me 3 practical tips for studying effectively for MSCE exams in Malawi.', icon: <GraduationCap className="w-3 h-3 text-indigo-400" /> },
    { label: 'Chichewa Help', prompt: 'Mungandithandize bwanji pasukulu yanga ya Chichewa MSCE?', icon: <BookOpen className="w-3 h-3 text-orange-400" /> }
  ],
  mathematics: [
    { label: 'Quadratic Equations', prompt: 'Can you explain how to solve a quadratic equation step-by-step?', icon: <Zap className="w-3 h-3 text-blue-400" /> },
    { label: 'Math Formulas', prompt: 'What are the key trigonometry formulas I need to memorize for MSCE?', icon: <Sparkles className="w-3 h-3 text-blue-400" /> }
  ],
  physics: [
    { label: 'Newtonian Physics', prompt: 'Explain Newton\'s laws of motion with a Malawi context, like a minibus stopping.', icon: <Zap className="w-3 h-3 text-green-400" /> },
    { label: 'Electricity Principles', prompt: 'Explain ohm\'s law and circuit calculations simply.', icon: <Sparkles className="w-3 h-3 text-green-400" /> }
  ],
  chemistry: [
    { label: 'Periodic Table', prompt: 'Help me understand chemical bonding (ionic vs covalent).', icon: <Zap className="w-3 h-3 text-yellow-400" /> },
    { label: 'Stoichiometry', prompt: 'Explain balancing chemical equations step-by-step.', icon: <Sparkles className="w-3 h-3 text-yellow-400" /> }
  ],
  biology: [
    { label: 'Photosynthesis', prompt: 'Help me outline the light and dark stages of photosynthesis.', icon: <Zap className="w-3 h-3 text-emerald-400" /> },
    { label: 'Genetics basics', prompt: 'Explain Mendel\'s laws of inheritance using monohybrid crosses.', icon: <Sparkles className="w-3 h-3 text-emerald-400" /> }
  ],
  english: [
    { label: 'Novel Themes', prompt: 'Give me key themes of "The Pearl" or other prescribed MSCE texts.', icon: <Zap className="w-3 h-3 text-purple-400" /> },
    { label: 'Passive Voice', prompt: 'Can you show me how to rewrite active sentences into passive voice for the MSCE grammar section?', icon: <Sparkles className="w-3 h-3 text-purple-400" /> }
  ],
  chichewa: [
    { label: 'Ndakatulo', prompt: 'Kodi ndakatulo ndi chiyani ndipo zigawo zake zofunika ndi chiyani?', icon: <Zap className="w-3 h-3 text-red-400" /> },
    { label: 'Mbiri', prompt: 'Mungandifotokozere bwanji za kasambitsidwe ka chiyankhulo cha Chichewa m\'Malawi?', icon: <Sparkles className="w-3 h-3 text-red-400" /> }
  ]
}

const ThinkingDots = () => (
  <div className="flex gap-1.5 px-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
        className="w-1.5 h-1.5 bg-[#6366f1] rounded-full"
        style={{ backgroundColor: 'var(--subject-color)' }}
      />
    ))}
  </div>
)

// ─── Voice-enabled Interactive Quiz Card ─────────────────────────────────────
function QuizCard({ quiz }: { quiz: QuizData }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const recRef = useRef<any>(null)

  const handleSelect = (idx: number) => {
    if (submitted) return
    setSelectedIdx(idx)
  }

  const handleSubmit = () => {
    if (selectedIdx === null || submitted) return
    setSubmitted(true)
    if (selectedIdx === quiz.correctIndex) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.85 } })
    }
  }

  // Fuzzy-match transcript to the closest option
  const matchTranscriptToOption = (transcript: string): number => {
    const t = transcript.toLowerCase().trim()
    let bestIdx = -1
    let bestScore = 0
    quiz.options.forEach((opt, idx) => {
      const o = opt.toLowerCase()
      // Score: count common words
      const optWords = o.split(/\s+/)
      const tWords = t.split(/\s+/)
      const common = optWords.filter(w => tWords.some(tw => tw.includes(w) || w.includes(tw))).length
      const score = common / Math.max(optWords.length, 1)
      // Also check if transcript directly contains the option letter (A, B, C, D)
      const letter = String.fromCharCode(65 + idx).toLowerCase()
      if (t === letter || t.startsWith(letter + ' ') || t.startsWith(letter + '.')) {
        if (1 > bestScore) { bestScore = 1; bestIdx = idx }
        return
      }
      if (score > bestScore) { bestScore = score; bestIdx = idx }
    })
    return bestScore > 0 ? bestIdx : -1
  }

  const startVoiceRecording = () => {
    if (submitted) return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Voice not supported in this browser. Try Chrome.')
      return
    }
    setVoiceError('')
    setVoiceTranscript('')
    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onstart = () => setIsRecording(true)
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setVoiceTranscript(transcript)
      const matched = matchTranscriptToOption(transcript)
      if (matched >= 0) {
        setSelectedIdx(matched)
      } else {
        setVoiceError(`Heard: "${transcript}" — couldn't match an option. Try again or tap an option.`)
      }
    }
    rec.onerror = (e: any) => {
      setIsRecording(false)
      if (e.error !== 'no-speech') setVoiceError('Could not hear you. Please try again.')
    }
    rec.onend = () => {
      setIsRecording(false)
      // clear ref on natural end
      if (recRef.current === rec) recRef.current = null
    }
    recRef.current = rec
    try {
      rec.start()
    } catch (err) {
      console.error('startVoiceRecording error', err)
      setVoiceError('Unable to start voice recording. Please try again.')
      setIsRecording(false)
      if (recRef.current === rec) recRef.current = null
    }
  }

  const stopVoiceRecording = () => {
    try {
      recRef.current?.stop()
    } catch (err) {
      console.error('stopVoiceRecording error', err)
    }
    setIsRecording(false)
    recRef.current = null
  }

  return (
    <div className="bg-[#1f1f23] border border-white/10 rounded-3xl p-5 my-4 shadow-xl max-w-xl text-left">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ color: 'var(--subject-color)', backgroundColor: 'var(--subject-color-alpha)' }}>
          Quiz Question
        </span>
        <div className="flex items-center gap-2">
          {submitted && (
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              selectedIdx === quiz.correctIndex ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {selectedIdx === quiz.correctIndex ? 'Correct! 🎉' : 'Incorrect ❌'}
            </span>
          )}
          {/* Voice Mode Toggle */}
          {!submitted && (
            <button
              onClick={() => { setVoiceMode(v => !v); setVoiceError(''); setVoiceTranscript('') }}
              title={voiceMode ? 'Switch to tap mode' : 'Switch to voice mode'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border smooth-transition ${
                voiceMode
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-white/10 bg-white/5 text-text-muted hover:text-white hover:border-white/20'
              }`}
            >
              {voiceMode ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              {voiceMode ? 'Voice ON' : 'Voice'}
            </button>
          )}
        </div>
      </div>

      <h4 className="text-white font-bold text-base mb-4 leading-snug">{quiz.question}</h4>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {quiz.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx
          const isCorrect = idx === quiz.correctIndex
          let btnClass = 'w-full text-left px-4 py-3 rounded-xl text-sm font-medium border smooth-transition flex items-center '
          if (submitted) {
            if (isCorrect) btnClass += 'bg-green-500/10 border-green-500/30 text-green-300'
            else if (isSelected) btnClass += 'bg-red-500/10 border-red-500/30 text-red-300'
            else btnClass += 'bg-white/5 border-white/5 text-text-muted opacity-50'
          } else {
            if (isSelected) btnClass += 'bg-white/10 border-primary text-white'
            else btnClass += 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:border-white/10'
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={btnClass}
              style={{ borderColor: !submitted && isSelected ? 'var(--subject-color)' : undefined }}
            >
              <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center mr-3 text-xs font-bold ${
                submitted && isCorrect ? 'bg-green-500 text-white' :
                submitted && isSelected ? 'bg-red-500 text-white' :
                isSelected ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary'
              }`} style={{ backgroundColor: !submitted && isSelected ? 'var(--subject-color)' : undefined }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
              {/* Voice-matched indicator */}
              {!submitted && isSelected && voiceMode && voiceTranscript && (
                <span className="ml-auto text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <Mic className="w-2.5 h-2.5" /> matched
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Voice Recorder Section */}
      {voiceMode && !submitted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              🎤 Say your answer aloud (e.g. "A", "Option B", or the answer text)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm smooth-transition ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white/10 text-text-secondary hover:bg-white/15 hover:text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                  <Radio className="w-4 h-4" /> Stop Recording
                </>
              ) : (
                <><Mic className="w-4 h-4" /> Start Recording</>  
              )}
            </button>
            {voiceTranscript && (
              <div className="flex-1 text-xs text-emerald-400 font-medium truncate">
                Heard: &ldquo;{voiceTranscript}&rdquo;
              </div>
            )}
          </div>
          {voiceError && (
            <p className="text-[10px] text-amber-400 mt-2 leading-tight">{voiceError}</p>
          )}
        </motion.div>
      )}

      {/* Submit / Explanation */}
      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={selectedIdx === null}
          className="w-full text-white font-bold py-3.5 rounded-xl smooth-transition"
          style={{ backgroundColor: 'var(--subject-color)' }}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" /> Check Answer
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-3 border border-white/5 mt-3 text-xs"
        >
          <p className="font-bold text-white mb-1 uppercase tracking-widest">Explanation</p>
          <p className="text-text-muted leading-relaxed">{quiz.explanation}</p>
        </motion.div>
      )}
    </div>
  )
}

export default function AITutorPage() {
  const [subject, setSubject] = useState('all')
  const [learningMode, setLearningMode] = useState('explain')
  const [messages, setMessages] = useState<Message[]>([])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  
  // Speech STT State
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Create SpeechRecognition instance with handlers
  const createRecognition = () => {
    if (typeof window === 'undefined') return null
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return null
    try {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'
      rec.onstart = () => setIsListening(true)
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => (prev && prev.trim().length > 0) ? `${prev} ${transcript}` : transcript)
      }
      rec.onerror = (e: any) => {
        console.error('recognition error', e)
        setIsListening(false)
      }
      rec.onend = () => setIsListening(false)
      recognitionRef.current = rec
      return rec
    } catch (err) {
      console.error('createRecognition failed', err)
      return null
    }
  }

  // Get active subject configuration
  const activeSubject = SUBJECTS.find(s => s.id === subject) || SUBJECTS[0]

  // Setup conversations based on subject + mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `yaza_chat_v2_${subject}_${learningMode}`
      const savedMessages = localStorage.getItem(storageKey)
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      } else {
        const welcomeText = getWelcomeText(subject, learningMode)
        const defaultMessages: Message[] = [{ role: 'assistant', content: welcomeText }]
        setMessages(defaultMessages)
        localStorage.setItem(storageKey, JSON.stringify(defaultMessages))
      }
    }
    // Stop any speech when switching modes/subjects
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
    }
  }, [subject, learningMode])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])
  // Scroll to bottom

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // initialize recognition if available
      createRecognition()
    }
  }, [])

  const getWelcomeText = (sub: string, mode: string) => {
    const subName = SUBJECTS.find(s => s.id === sub)?.name || 'MSCE'
    if (mode === 'quiz') {
      return `Zabwino! Let's start an interactive multiple-choice quiz on **${subName}**. What topic should we focus on? Choose a topic below or type one (e.g. 'Photosynthesis' or 'Fraction rules') and I'll generate quiz questions.`
    }
    if (mode === 'revision') {
      return `Welcome to your **${subName} Exam Revision** assistant! Ask me any concept, past topic, or syllabus requirement. I will provide short summaries, test questions, and exam tips.`
    }
    return `Zabwino! I am your **Yaza AI Tutor** for **${subName}**. I am specialized in the Malawi MSCE syllabus. What concept should we break down and learn today?`
  }

  const handleSend = async (customPrompt?: string) => {
    const messageToSend = customPrompt || input.trim()
    if (!messageToSend || isLoading) return

    if (!customPrompt) setInput('')
    
    // Cancel voice dictation if listening
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (err) { console.error('stop recognition on send', err) }
      setIsListening(false)
    }

    const updatedMessages = [...messages, { role: 'user' as const, content: messageToSend }]
    setMessages(updatedMessages)
    setIsLoading(true)

    // Save to local storage
    const storageKey = `yaza_chat_v2_${subject}_${learningMode}`
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages))

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          subject,
          learningMode
        })
      })

      const data = await response.json()
      if (response.ok && data.content) {
        const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: data.content }]
        setMessages(finalMessages)
        localStorage.setItem(storageKey, JSON.stringify(finalMessages))
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            variant: 'notice',
            content: data.error || "Something went wrong while getting your answer. Please try again in a moment.",
          },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          variant: 'notice',
          content: "We couldn't reach Yaza AI. Check your internet connection and try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Text-To-Speech function
  const speakText = (text: string, msgIndex: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (speakingId === msgIndex) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()

    // Strip out quiz JSON blocks to speak only readable text
    const cleanText = text
      .replace(/```yaza-quiz[\s\S]*?```/g, 'An interactive quiz question is displayed on the screen for you.')
      .replace(/[*#_`~]/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    setSpeakingId(msgIndex)
    window.speechSynthesis.speak(utterance)
  }

  // Speech Recognition control
  const toggleListening = () => {
    if (!recognitionRef.current) {
      const rec = createRecognition()
      if (!rec) {
        alert('Speech-to-text dictation is not supported in this browser. Try Google Chrome!')
        return
      }
    }
    const rec = recognitionRef.current
    if (isListening) {
      try { rec?.stop() } catch (err) { console.error('stop listen error', err) }
      setIsListening(false)
    } else {
      try {
        setIsListening(true)
        rec?.start()
      } catch (err) {
        console.error('start listen error', err)
        setIsListening(false)
      }
    }
  }

  // Global keyboard shortcuts: '/' or Ctrl+K to focus input, Ctrl+M to toggle mic
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or textareas
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return

      if (e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        toggleListening()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isListening])

  // Reset thread
  const handleResetThread = () => {
    if (!confirm('Are you sure you want to clear the conversation history for this subject and mode?')) return
    const storageKey = `yaza_chat_v2_${subject}_${learningMode}`
    const welcome = getWelcomeText(subject, learningMode)
    const initialMsgs: Message[] = [{ role: 'assistant', content: welcome }]
    setMessages(initialMsgs)
    localStorage.setItem(storageKey, JSON.stringify(initialMsgs))
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
    }
  }

  // Parsing code blocks for quiz rendering
  const renderMessageContent = (content: string) => {
    const quizRegex = /```yaza-quiz\s*([\s\S]*?)\s*```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = quizRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          data: content.slice(lastIndex, match.index)
        })
      }
      
      try {
        const quizData = JSON.parse(match[1].trim())
        parts.push({
          type: 'quiz',
          data: quizData
        })
      } catch (e) {
        console.error('Failed to parse yaza-quiz JSON:', e, match[1])
        parts.push({
          type: 'text',
          data: match[0]
        })
      }
      
      lastIndex = quizRegex.lastIndex
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        data: content.slice(lastIndex)
      })
    }

    return (
      <div className="space-y-4">
        {parts.map((part, i) => {
          if (part.type === 'quiz') {
            return <QuizCard key={i} quiz={part.data} />
          } else {
            return (
              <div key={i} className="markdown-content prose prose-invert prose-sm md:prose-base max-w-none">
                <ReactMarkdown>{part.data}</ReactMarkdown>
              </div>
            )
          }
        })}
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-[#080808] flex flex-col font-sans selection:bg-primary/30 overflow-hidden relative"
      style={{ 
        // Inject subject colors dynamically
        ['--subject-color' as any]: activeSubject.color,
        ['--subject-color-alpha' as any]: `${activeSubject.color}15`,
        ['--subject-color-glow' as any]: `${activeSubject.color}33`,
      }}
    >
      {/* Background Blobs dynamically matching selected subject color */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full blur-[120px] transition-all duration-700" 
          style={{ backgroundColor: `${activeSubject.color}08` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full blur-[120px] transition-all duration-700" 
          style={{ backgroundColor: `${activeSubject.color}03` }}
        />
      </div>

      {/* Header */}
      <header className="z-40 px-4 py-3 md:px-6 md:py-4 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
                <Image src="/mwiri-logo.svg" alt="Mwiri" width={40} height={40} className="object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-lg font-black text-white truncate flex items-center gap-2">
                  Yaza AI <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-[#6366f1]/10 text-xs font-bold uppercase tracking-tighter" style={{ color: 'var(--subject-color)', backgroundColor: 'var(--subject-color-alpha)' }}>Tutor v2</span>
                </h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-bold text-green-500/80 uppercase tracking-widest">MSCE Syllabus Expert</span>
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
              onClick={handleResetThread} 
              className="text-text-muted hover:bg-red-500/10 hover:text-red-400 h-9 w-9 rounded-xl"
              title="Clear Subject Chat"
            >
              <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dynamic Sub-bar for Subject & Mode selection */}
      <div className="z-30 border-b border-white/5 bg-black/40 backdrop-blur-sm py-3 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          
          {/* Subject badge list */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] uppercase tracking-widest font-black text-text-muted mr-1">Subject:</span>
            {SUBJECTS.map((sub) => {
              const active = subject === sub.id
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border smooth-transition shrink-0 ${
                    active 
                      ? 'text-white shadow-lg' 
                      : 'bg-[#121212] border-white/5 text-text-muted hover:text-text hover:border-white/10'
                  }`}
                  style={{
                    backgroundColor: active ? sub.color : undefined,
                    borderColor: active ? sub.color : undefined,
                    boxShadow: active ? `0 4px 14px ${sub.color}40` : undefined
                  }}
                >
                  <span>{sub.icon}</span>
                  {sub.name}
                </button>
              )
            })}
          </div>

          {/* Mode list selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-text-muted mr-1">Tutor Mode:</span>
            <div className="flex bg-[#121212] p-1 rounded-xl border border-white/5">
              {MODES.map((mode) => {
                const active = learningMode === mode.id
                return (
                  <button
                    key={mode.id}
                    onClick={() => setLearningMode(mode.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 smooth-transition ${
                      active
                        ? 'text-white'
                        : 'text-text-muted hover:text-text'
                    }`}
                    style={{
                      backgroundColor: active ? 'var(--subject-color)' : undefined,
                      boxShadow: active ? `0 4px 12px var(--subject-color-glow)` : undefined
                    }}
                    title={mode.desc}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 md:space-y-8 scroll-smooth custom-scrollbar relative z-10"
      >
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-48">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            renderMessageContent={renderMessageContent}
            speakText={speakText}
            speakingId={speakingId}
          />
        </div>
      </div>

      {/* Input container */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-4 md:pb-8" style={{ zIndex: 99999 }}>
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Quick Action Chips dynamically matching selected subject */}
          {messages.length < 3 && QUICK_ACTIONS[subject] && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
              {QUICK_ACTIONS[subject].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#121215] border border-white/5 text-[10px] md:text-xs font-bold text-text-secondary whitespace-nowrap hover:bg-[#1a1a20] hover:border-[#6366f1]/40 transition-all shadow-lg"
                  style={{ ['--tw-border-opacity' as any]: 0.3 }}
                >
                  {action.icon}
                  {action.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Main Input Area */}
          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isLoading={isLoading}
            isListening={isListening}
            toggleListening={toggleListening}
            inputRef={inputRef}
            activeSubject={activeSubject}
          />
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
              className="relative w-full max-w-lg bg-[#121215] border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden text-left"
            >
              <div 
                className="absolute top-0 left-0 w-full h-1.5 transition-all duration-500" 
                style={{ backgroundColor: 'var(--subject-color)' }}
              />
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                  <Image src="/mwiri-logo.svg" alt="Mwiri" width={48} height={48} className="object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Yaza AI</h2>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest" style={{ color: 'var(--subject-color)' }}>MSCE Interactive Specialist</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
                <p>
                  Yaza AI is configured for the **Malawi School Certificate of Education (MSCE)** syllabus. We've introduced several key enhancements in v2:
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xl">🎨</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Subject Themes</p>
                      <p className="text-[10px] leading-tight text-text-muted">Dynamic page styling tailored specifically to the subject you are currently studying.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xl">🏆</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Interactive Quizzes</p>
                      <p className="text-[10px] leading-tight text-text-muted">Select Quiz Mode and answer Yaza\'s multiple-choice cards. Check correct answers instantly with animations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xl">🔊</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Voice Assistant</p>
                      <p className="text-[10px] leading-tight text-text-muted">Listen to explanations aloud with Text-to-Speech, or use the microphone button to dictate questions.</p>
                    </div>
                  </div>
                </div>
                <p className="pt-2 italic text-xs text-text-muted">
                  Note: Conversations are stored locally for privacy and speed. Clear them anytime by clicking the reset icon.
                </p>
              </div>

              <Button 
                onClick={() => setShowInfo(false)}
                className="w-full mt-6 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-bold py-5 rounded-2xl shadow-xl transition-all"
                style={{ backgroundColor: 'var(--subject-color)', boxShadow: '0 4px 14px var(--subject-color-glow)' }}
              >
                Let's Study!
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
        .markdown-content ul, .markdown-content ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .markdown-content li { list-style-type: disc; margin-bottom: 0.25rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

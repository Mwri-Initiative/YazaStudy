'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import SubjectCard from '../components/SubjectCard'
import { Subject } from '../types'
import { ArrowRight, BookOpen, CheckCircle2, Sparkles, Star, Users, Zap, ShieldCheck, Brain, Smartphone } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import { motion } from 'framer-motion'

const subjects: Subject[] = [
  { id: 'mathematics', name: 'Mathematics', description: 'MSCE study materials, past papers and solutions.', icon: '∑', color: '#2196F3' },
  { id: 'physics', name: 'Physics', description: 'Notes, experiments and practice questions.', icon: '⚛', color: '#2E8B57' },
  { id: 'chemistry', name: 'Chemistry', description: 'Notes, formulas and practical study guides.', icon: '⚗', color: '#FFC107' },
  { id: 'biology', name: 'Biology', description: 'Study materials, diagrams and illustrations.', icon: '🧬', color: '#4CAF50' },
  { id: 'english', name: 'English Language', description: 'Grammar, literature and composition guides.', icon: '📝', color: '#9C27B0' },
  { id: 'chichewa', name: 'Chichewa', description: 'Chichewa language and literature materials.', icon: '📖', color: '#FF5722' },
]

const stats = [
  { value: '5,000+', label: 'Students' },
  { value: '200+', label: 'Materials' },
  { value: '6', label: 'MSCE Subjects' },
  { value: '98%', label: 'Pass Rate' },
]

const features = [
  { icon: CheckCircle2, title: 'MSCE-focused content', text: 'Study resources organized around what Malawian students actually need for exams.' },
  { icon: Brain, title: 'Smarter studying', text: 'Use Yaza tools to practice, understand difficult topics and build confidence.' },
  { icon: Smartphone, title: 'Made for your phone', text: 'A fast, comfortable study experience designed around mobile learning.' },
  { icon: Zap, title: 'Learn without friction', text: 'Find materials quickly and get from the homepage to studying in a few taps.' },
]

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute -right-40 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
              {isAuthenticated && (
                <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary sm:text-sm">
                  <span>👋</span><span className="truncate">Welcome back, {user?.name.split(' ')[0]}</span>
                </div>
              )}

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.16em] text-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-secondary" /> Built for Malawian students
              </div>

              <h1 className="max-w-3xl text-[2.65rem] font-black leading-[1.03] tracking-[-.045em] text-text sm:text-6xl lg:text-7xl">
                Study smarter.<br />
                <span className="gradient-text">Prepare with confidence.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg lg:text-xl">
                Yaza Study brings MSCE materials, practice resources and a growing set of smart learning tools into one simple place.
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <Button size="lg" className="h-12 rounded-2xl bg-primary px-6 font-extrabold text-white shadow-xl shadow-primary/20 hover:bg-primary-dark" onClick={() => router.push('/shop')}>
                  Explore study materials <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/[.035] px-6 font-bold text-text-secondary hover:bg-white/[.07] hover:text-text" onClick={() => router.push('/ai-tutor')}>
                  <Brain className="mr-2 h-5 w-5 text-primary" /> Try AI Tutor
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-text-muted sm:text-sm">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Student-first</span>
                <span className="inline-flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-accent" /> Mobile-first</span>
                <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-secondary" /> MSCE focused</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: .96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .65, delay: .08 }} className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-2xl" />
              <div className="glass-dark relative overflow-hidden rounded-[28px] border border-white/10 p-4 shadow-2xl sm:rounded-[32px] sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.15em] text-text-muted">Your study hub</p>
                    <p className="mt-1 text-lg font-extrabold text-text">Everything in one place</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary"><BookOpen className="h-5 w-5" /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/shop" className="group rounded-2xl border border-white/8 bg-white/[.035] p-4 hover:border-primary/30 hover:bg-primary/5 smooth-transition">
                    <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                    <p className="font-extrabold text-text">Materials</p>
                    <p className="mt-1 text-xs leading-5 text-text-muted">Notes & past papers</p>
                  </Link>
                  <Link href="/ai-tutor" className="group rounded-2xl border border-white/8 bg-white/[.035] p-4 hover:border-accent/30 hover:bg-accent/5 smooth-transition">
                    <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Brain className="h-5 w-5" /></div>
                    <p className="font-extrabold text-text">AI Tutor</p>
                    <p className="mt-1 text-xs leading-5 text-text-muted">Understand harder topics</p>
                  </Link>
                  <div className="col-span-2 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 to-transparent p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Study tip</p><p className="mt-1 text-sm font-bold text-text">Small, consistent sessions beat last-minute cramming.</p></div>
                      <Star className="hidden h-6 w-6 shrink-0 text-secondary sm:block" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-[24px] border border-white/8 bg-white/[.025] sm:rounded-[28px] md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`px-4 py-5 text-center sm:py-6 ${i % 2 !== 0 ? 'border-l border-white/8 md:border-l' : ''} ${i > 1 ? 'border-t border-white/8 md:border-t-0' : ''}`}>
              <div className="text-2xl font-black tracking-tight text-secondary sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-text-muted sm:text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Why Yaza</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-text sm:text-5xl">A better way to <span className="text-primary">study</span></h2>
            <p className="mt-4 text-base leading-7 text-text-muted sm:text-lg">Designed to make finding, understanding and using study resources feel simple.</p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }}>
                  <Card className="glass-dark h-full rounded-[22px] border-white/8 p-2 hover:-translate-y-1 hover:border-primary/25 smooth-transition">
                    <CardHeader className="pb-3">
                      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                      <CardTitle className="text-base font-extrabold text-text">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm leading-6 text-text-muted">{feature.text}</CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="mx-3 mb-16 rounded-[28px] border border-white/8 bg-white/[.025] px-4 py-12 sm:mx-5 sm:rounded-[34px] sm:px-6 sm:py-16 lg:mx-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-secondary">MSCE catalog</span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-text sm:text-5xl">Choose your subject</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">Start with a subject, then go deeper with the materials available on Yaza Study.</p>
            </div>
            <Button variant="ghost" className="w-fit rounded-xl font-bold text-primary hover:bg-primary/10" onClick={() => router.push('/shop')}>View all <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, index) => <SubjectCard key={subject.id} subject={subject} index={index} />)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/20 via-primary/8 to-accent/10 px-5 py-12 text-center sm:rounded-[34px] sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Users className="h-6 w-6" /></div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-text sm:text-5xl">Ready to make your next study session count?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">Explore the resources, practice tools and learning features built to help you prepare with confidence.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 rounded-2xl bg-primary px-7 font-extrabold text-white shadow-xl shadow-primary/20" onClick={() => router.push('/shop')}>Explore Materials <ArrowRight className="ml-2 h-5 w-5" /></Button>
              {!isAuthenticated && <Button size="lg" variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/[.035] px-7 font-bold text-text" onClick={() => router.push('/auth?mode=register')}>Create free account</Button>}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

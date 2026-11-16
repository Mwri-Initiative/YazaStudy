'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, BookOpen, Brain, CalendarDays, CheckCircle2, FileText,
  GraduationCap, Layers, Library, Search, Sparkles, ShoppingBag, Zap
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../lib/auth-context'
import { createClient } from '../../lib/supabase/client'
import { StudyMaterial } from '../../types'

type LibraryEntry = {
  purchased_at: string
  materials: StudyMaterial | null
}

export default function StudentDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || !user) {
      router.replace('/auth?redirect=/dashboard')
      setIsLoading(false)
      return
    }

    let cancelled = false
    const loadLibrary = async () => {
      setIsLoading(true)
      setLoadError('')
      const { data, error } = await supabase
        .from('user_materials')
        .select('purchased_at, materials (*)')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false })

      if (cancelled) return
      if (error) {
        console.error('Dashboard library fetch failed:', error)
        setLoadError('We could not load your study library. Please try again.')
        setEntries([])
      } else {
        const rows = (data || []) as unknown as LibraryEntry[]
        setEntries(rows.filter(row => row.materials))
      }
      setIsLoading(false)
    }

    loadLibrary()
    return () => { cancelled = true }
  }, [authLoading, isAuthenticated, user, router, supabase])

  const materials = useMemo(
    () => entries.map(entry => entry.materials).filter((material): material is StudyMaterial => Boolean(material)),
    [entries]
  )
  const subjectCount = useMemo(
    () => new Set(materials.map(material => material.subject).filter(Boolean)).size,
    [materials]
  )
  const recentEntries = entries.filter(entry => entry.materials).slice(0, 4)
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Student'

  const formatDate = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? 'Recently added'
      : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (authLoading || (isLoading && !user)) {
    return (
      <main className="min-h-screen px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-5">
          <div className="h-10 w-64 rounded-xl bg-white/10" />
          <div className="h-52 rounded-[28px] bg-white/5" />
          <div className="grid gap-4 sm:grid-cols-3"><div className="h-28 rounded-2xl bg-white/5" /><div className="h-28 rounded-2xl bg-white/5" /><div className="h-28 rounded-2xl bg-white/5" /></div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-violet-600/15 blur-[110px]" />
        <div className="absolute -right-40 top-72 h-96 w-96 rounded-full bg-cyan-500/10 blur-[110px]" />
        <div className="absolute left-1/3 top-[55rem] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-violet-300">
              <Sparkles className="h-3.5 w-3.5" /> Your learning space
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Welcome back, <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">{firstName}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Your study resources, learning tools and next steps — all in one place.
            </p>
          </div>
          <Button onClick={() => router.push('/shop')} className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 font-bold text-white shadow-lg shadow-violet-950/40 hover:from-violet-500 hover:to-indigo-500">
            <ShoppingBag className="mr-2 h-4 w-4" /> Explore materials <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-[#21163d] via-[#171a35] to-[#102b3a] p-5 shadow-2xl shadow-black/20 sm:mb-8 sm:p-8 lg:p-10">
          <div aria-hidden="true" className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[36px] border-cyan-300/5" />
          <div aria-hidden="true" className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-cyan-200"><Zap className="h-4 w-4" /> Make today count</div>
              <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">A little progress every day adds up.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Pick a resource from your library or explore more MSCE materials to keep your learning moving.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => router.push('/my-materials')} className="h-11 rounded-xl bg-cyan-300 px-5 font-extrabold text-slate-950 hover:bg-cyan-200"><Library className="mr-2 h-4 w-4" /> Open my library</Button>
                <Button variant="outline" onClick={() => router.push('/ai-tutor')} className="h-11 rounded-xl border-white/20 bg-white/5 px-5 font-bold text-white hover:bg-white/10"><Brain className="mr-2 h-4 w-4" /> Ask AI Tutor</Button>
              </div>
            </div>
            <div className="hidden h-36 w-36 items-center justify-center rounded-[32px] border border-white/10 bg-white/[.06] shadow-inner sm:flex lg:mr-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-cyan-100 shadow-lg shadow-violet-950/40"><GraduationCap className="h-12 w-12" /></div>
            </div>
          </div>
        </section>

        {loadError && (
          <div role="alert" className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl border-rose-300/30 text-rose-100 hover:bg-rose-300/10">Try again</Button>
          </div>
        )}

        <section aria-label="Your library summary" className="mb-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <Card className="rounded-2xl border-white/10 bg-[#11131d]/90 text-white shadow-xl shadow-black/10">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300"><BookOpen className="h-6 w-6" /></div>
              <div><p className="text-2xl font-black">{isLoading ? '—' : materials.length}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">Materials in your library</p></div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-white/10 bg-[#11131d]/90 text-white shadow-xl shadow-black/10">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300"><Layers className="h-6 w-6" /></div>
              <div><p className="text-2xl font-black">{isLoading ? '—' : subjectCount}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">Subjects represented</p></div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-white/10 bg-[#11131d]/90 text-white shadow-xl shadow-black/10">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-400/15 text-fuchsia-300"><CheckCircle2 className="h-6 w-6" /></div>
              <div><p className="text-2xl font-black">{isLoading ? '—' : 'Ready'}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">Your library status</p></div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-violet-300">Pick up where you left off</p><h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Recently added</h2></div>
            <Link href="/my-materials" className="inline-flex items-center gap-1 text-sm font-bold text-cyan-300 hover:text-cyan-200">View library <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map(item => <div key={item} className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/5" />)}</div>
          ) : recentEntries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentEntries.map(entry => {
                const material = entry.materials
                if (!material) return null
                return (
                  <Card key={material.id} className="group overflow-hidden rounded-2xl border-white/10 bg-[#11131d]/90 text-white transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-xl hover:shadow-violet-950/20">
                    <CardHeader className="p-4 pb-2">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-violet-400/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-200">{material.subject || 'Study material'}</span>
                        <FileText className="h-4 w-4 text-cyan-300" />
                      </div>
                      <CardTitle className="line-clamp-2 min-h-11 text-base font-extrabold leading-snug text-white group-hover:text-cyan-200">{material.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="mb-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">{material.description || 'Open this resource from your personal study library.'}</p>
                      <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500"><CalendarDays className="h-3 w-3" /> {formatDate(entry.purchased_at)}</span>
                        <Link href={`/my-materials?focus=${encodeURIComponent(material.id)}`} className="inline-flex items-center gap-1 text-xs font-extrabold text-cyan-300 hover:text-cyan-200">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[.025] px-5 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300"><BookOpen className="h-7 w-7" /></div>
              <h3 className="mt-4 text-lg font-extrabold text-white">Your library is ready for its first resource</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Browse the study shop and add learning materials to build your personal collection.</p>
              <Button onClick={() => router.push('/shop')} className="mt-5 rounded-xl bg-violet-600 px-5 font-bold text-white hover:bg-violet-500"><Search className="mr-2 h-4 w-4" /> Find study materials</Button>
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link href="/shop" className="group rounded-[24px] border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-transparent p-5 transition-colors hover:border-violet-300/30 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300"><ShoppingBag className="h-5 w-5" /></div>
            <h3 className="mt-4 text-lg font-extrabold text-white">Discover more materials</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">Find notes, revision guides and past papers by subject.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-300">Explore the shop <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link href="/ai-tutor" className="group rounded-[24px] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 to-transparent p-5 transition-colors hover:border-cyan-300/30 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300"><Brain className="h-5 w-5" /></div>
            <h3 className="mt-4 text-lg font-extrabold text-white">Get help understanding a topic</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">Open the AI Tutor when you need another explanation or a study nudge.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">Visit AI Tutor <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </section>

        <p className="mt-8 text-center text-xs text-slate-600">Your dashboard reflects materials currently linked to your Yaza Study account.</p>
      </div>
    </main>
  )
}

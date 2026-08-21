'use client'

import { Suspense, useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { StudyMaterial } from '../../types'
import { Download, Eye, Search, BookOpen, Clock, Layers, WifiOff } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { useAuth } from '../../lib/auth-context'
import PdfViewerModal from '../../components/PdfViewerModal'
import OfflineMaterialButton from '../../components/OfflineMaterialButton'
import { getOfflineMaterialUrl } from '../../lib/offline-materials'

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const parts = url.pathname.split('/public/materials/')
    if (parts.length > 1) return parts[1].split('?')[0]
    const bucketIdx = url.pathname.indexOf('/materials/')
    if (bucketIdx !== -1) return url.pathname.slice(bucketIdx + '/materials/'.length).split('?')[0]
    return null
  } catch {
    return null
  }
}

function MyMaterialsPageContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null)
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchMyMaterials = async () => {
      if (!user) return
      setIsLoading(true)
      const { data, error } = await supabase.from('user_materials').select(`purchased_at, materials (*)`).eq('user_id', user.id)
      if (error) console.error('Error fetching materials:', error)
      else {
        const flattened = (data || []).filter(item => item.materials).map(item => item.materials as unknown as StudyMaterial)
        setMaterials(flattened)
        const focusId = searchParams?.get('focus')
        if (focusId && flattened.some(m => m.id === focusId)) setPendingFocusId(focusId)
      }
      setIsLoading(false)
    }
    if (!authLoading) {
      if (isAuthenticated) fetchMyMaterials()
      else { router.push('/auth?redirect=/my-materials'); setIsLoading(false) }
    }
  }, [user, isAuthenticated, authLoading, supabase, router, searchParams])

  const filteredMaterials = materials.filter(material => {
    const q = searchTerm.toLowerCase()
    return (material.title || '').toLowerCase().includes(q) || (material.description || '').toLowerCase().includes(q)
  }).filter(material => selectedSubject === 'all' || material.subject === selectedSubject)

  const getSecureUrl = async (material: StudyMaterial, lifetime = 3600) => {
    const url = material.previewUrl || material.downloadUrl
    if (!url) throw new Error('Material content not yet available.')
    const path = extractStoragePath(url)
    if (!path) throw new Error('Could not parse storage path from URL')
    const { data, error } = await supabase.storage.from('materials').createSignedUrl(path, lifetime)
    if (error) throw error
    return data.signedUrl
  }

  const handleDownload = async (material: StudyMaterial) => {
    try { window.open(await getSecureUrl(material, 120), '_blank') }
    catch (err) { console.error('Download error:', err); alert('Failed to generate secure download link. Please try again.') }
  }

  const handlePreview = async (material: StudyMaterial) => {
    try {
      const offlineUrl = await getOfflineMaterialUrl(material.id)
      if (offlineUrl) {
        setActiveMaterial({ ...material, previewUrl: offlineUrl })
        setViewerOpen(true)
        return
      }
      const signedUrl = await getSecureUrl(material)
      setActiveMaterial({ ...material, previewUrl: signedUrl })
      setViewerOpen(true)
    } catch (err) {
      console.error('Error securing PDF access:', err)
      if (!navigator.onLine) alert('You are offline. Save this material for offline use while you are connected to the internet.')
      else alert('Failed to load secure material. Please try again or contact support.')
    }
  }

  useEffect(() => {
    if (!pendingFocusId || materials.length === 0) return
    const found = materials.find(m => m.id === pendingFocusId)
    if (!found) return
    const timer = window.setTimeout(() => { handlePreview(found); setPendingFocusId(null) }, 250)
    return () => window.clearTimeout(timer)
  }, [pendingFocusId, materials])

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-text-muted focus:outline-none focus:border-primary/60 focus:bg-primary/5 focus:ring-1 focus:ring-primary/30 smooth-transition text-sm'

  return (
    <div className="min-h-screen relative py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-1/4 -left-20 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full filter blur-3xl animate-blob" /><div className="absolute bottom-1/4 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-accent/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" /></div>
      <div className="relative max-w-7xl mx-auto">
        <div className="mb-7 sm:mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-primary"><BookOpen className="h-3 w-3" /> Your library</div><h1 className="mt-4 text-3xl md:text-5xl font-black font-display text-text tracking-tight">My Study Materials</h1><p className="mt-3 text-sm sm:text-lg text-text-secondary max-w-2xl font-body">Your personal collection of premium MSCE resources. Ready whenever you are.</p></div>
          <Button variant="outline" onClick={() => router.push('/offline-library')} className="min-h-11 rounded-xl border-white/10 glass font-bold"><WifiOff className="mr-2 h-4 w-4" /> Offline Library</Button>
        </div>
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-7 sm:mb-10 border-white/10"><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"><div className="lg:col-span-2"><label className="block text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Search Collection</label><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" /><input type="text" placeholder="e.g. Mathematics, Past Papers..." className={`${inputClass} pl-11`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div><div><label className="block text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Filter by Subject</label><select className={`${inputClass} appearance-none cursor-pointer`} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}><option value="all" className="bg-background">All Subjects</option><option value="mathematics" className="bg-background">Mathematics</option><option value="physics" className="bg-background">Physics</option><option value="chemistry" className="bg-background">Chemistry</option><option value="biology" className="bg-background">Biology</option><option value="english" className="bg-background">English</option><option value="chichewa" className="bg-background">Chichewa</option></select></div></div></div>
        <div className="flex items-center gap-3 mb-5 px-1"><div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /><p className="text-xs sm:text-sm text-text-muted font-medium">Found {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} in your library</p></div>
        {isLoading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass rounded-[24px] sm:rounded-[32px] h-[280px] animate-pulse border-white/5" />)}</div> : filteredMaterials.length > 0 ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{filteredMaterials.map(material => <Card key={material.id} className="glass rounded-[24px] sm:rounded-3xl hover-lift border-white/10 group smooth-transition"><CardHeader className="p-5 sm:p-6"><div className="flex justify-between items-start gap-3 mb-2"><div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">{material.subject}</div><div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wider border border-green-500/20">OWNED</div></div><CardTitle className="text-lg sm:text-xl font-display text-text group-hover:text-primary smooth-transition leading-tight">{material.title}</CardTitle></CardHeader><CardContent className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-5"><p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{material.description}</p><div className="grid grid-cols-2 gap-2.5 text-[10px] sm:text-[11px] font-bold text-text-muted uppercase"><div className="flex items-center gap-2 glass-dark rounded-xl px-3 py-2 border-white/5"><Clock className="h-3 w-3 text-primary" /> {material.pages} Pages</div><div className="flex items-center gap-2 glass-dark rounded-xl px-3 py-2 border-white/5"><Layers className="h-3 w-3 text-accent" /> {material.difficulty}</div></div><div className="grid grid-cols-2 gap-2.5 pt-1"><Button variant="outline" size="sm" onClick={() => handlePreview(material)} className="glass min-h-11 rounded-xl border-white/10 text-text hover:bg-white/5"><Eye className="mr-1.5 h-4 w-4" /> View</Button><OfflineMaterialButton material={material} /></div><Button className="w-full min-h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => handleDownload(material)}><Download className="mr-1.5 h-4 w-4" /> Download</Button></CardContent></Card>)}</div> : <div className="glass rounded-[28px] sm:rounded-[40px] border-white/10 py-16 sm:py-20 px-6 sm:px-8 text-center max-w-2xl mx-auto shadow-2xl"><div className="bg-white/5 rounded-3xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-5 sm:mb-6 border border-white/10 shadow-inner"><BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-text-muted" /></div><h3 className="text-xl sm:text-2xl font-bold text-text mb-3 font-display">Library Empty</h3><p className="text-sm sm:text-base text-text-muted mb-7 sm:mb-8 leading-relaxed max-w-sm mx-auto">{materials.length === 0 ? "You haven't unlocked any premium study materials yet. Start your journey by visiting the shop." : 'No materials match your current search or filter criteria. Try a different subject!'}</p>{materials.length === 0 && <Button className="min-h-12 bg-primary hover:bg-primary/90 text-white px-8 rounded-2xl font-bold shadow-lg shadow-primary/20" onClick={() => router.push('/shop')}>Browse Shop</Button>}</div>}
      </div>
      {activeMaterial && <PdfViewerModal isOpen={viewerOpen} onClose={() => setViewerOpen(false)} title={activeMaterial.title} pdfUrl={activeMaterial.previewUrl || activeMaterial.downloadUrl || ''} />}
    </div>
  )
}

export default function MyMaterialsPage() { return <Suspense fallback={<div className="min-h-screen px-4 py-12 sm:px-6"><div className="mx-auto max-w-7xl"><div className="h-10 w-56 animate-pulse rounded-xl bg-white/5" /><div className="mt-8 h-24 animate-pulse rounded-3xl bg-white/5" /><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="h-72 animate-pulse rounded-3xl bg-white/5" /><div className="h-72 animate-pulse rounded-3xl bg-white/5" /><div className="h-72 animate-pulse rounded-3xl bg-white/5" /></div></div></div>}><MyMaterialsPageContent /></Suspense> }

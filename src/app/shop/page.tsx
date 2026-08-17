'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import MaterialCard from '../../components/MaterialCard'
import { StudyMaterial } from '../../types'
import { Search, ShoppingCart, Sparkles, GraduationCap, SlidersHorizontal, X } from 'lucide-react'
import { createClient } from '../../lib/supabase/client'

export default function ShopPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true)
      const { data, error } = await supabase.from('materials').select('*').order('created_at', { ascending: false })
      if (error) console.error('Error fetching materials:', error)
      else { setMaterials(data || []); setFilteredMaterials(data || []) }
      setIsLoading(false)
    }
    fetchMaterials()
  }, [supabase])

  useEffect(() => {
    let filtered = materials
    if (searchTerm) filtered = filtered.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.description.toLowerCase().includes(searchTerm.toLowerCase()))
    if (selectedSubject !== 'all') filtered = filtered.filter(m => m.subject === selectedSubject)
    if (selectedType !== 'all') filtered = filtered.filter(m => m.type === selectedType)
    filtered = filtered.filter(m => m.price >= priceRange.min && m.price <= priceRange.max)
    setFilteredMaterials(filtered)
  }, [searchTerm, selectedSubject, selectedType, priceRange, materials])

  const handlePreview = (material: StudyMaterial) => window.open(material.previewUrl, '_blank')
  const clearFilters = () => { setSearchTerm(''); setSelectedSubject('all'); setSelectedType('all'); setPriceRange({ min: 0, max: 5000 }) }
  const activeFilters = Number(selectedSubject !== 'all') + Number(selectedType !== 'all') + Number(priceRange.max < 5000)

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary/50 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/10 smooth-transition'

  return (
    <main className="min-h-screen overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 top-[45%] h-96 w-96 rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <section className="glass-dark overflow-hidden rounded-[28px] border border-white/8 p-5 sm:rounded-[34px] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-primary"><GraduationCap className="h-3.5 w-3.5" /> MSCE resources</span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">Find what you need to <span className="gradient-text">study better.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">Browse free and premium materials by subject, search for a specific topic, and get straight to learning.</p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${inputClass} h-12 pl-11`} placeholder="Search notes, past papers, topics..." aria-label="Search study materials" />
            </div>
            <Button className="h-12 rounded-xl bg-primary px-5 font-bold text-white sm:hidden" onClick={() => setFiltersOpen(v => !v)}><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters {activeFilters > 0 && `(${activeFilters})`}</Button>
          </div>

          <div className={`${filtersOpen ? 'mt-4 grid' : 'hidden'} gap-3 sm:mt-5 sm:grid sm:grid-cols-3 lg:grid-cols-4`}>
            <select className={inputClass} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} aria-label="Filter by subject">
              <option value="all">All Subjects</option><option value="mathematics">Mathematics</option><option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="biology">Biology</option><option value="english">English</option><option value="chichewa">Chichewa</option>
            </select>
            <select className={inputClass} value={selectedType} onChange={e => setSelectedType(e.target.value)} aria-label="Filter by material type">
              <option value="all">All Types</option><option value="notes">Notes</option><option value="past-paper">Past Papers</option><option value="guide">Guides</option>
            </select>
            <div className="rounded-xl border border-white/10 bg-white/[.035] px-4 py-2.5 sm:col-span-1 lg:col-span-2">
              <div className="mb-1 flex justify-between text-[11px] font-bold text-text-muted"><span>Price</span><span>Up to MWK {priceRange.max.toLocaleString()}</span></div>
              <input type="range" min="0" max="5000" step="100" className="w-full accent-primary" value={priceRange.max} onChange={e => setPriceRange({ ...priceRange, max: Number(e.target.value) })} />
            </div>
          </div>

          {activeFilters > 0 && <button onClick={clearFilters} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"><X className="h-3.5 w-3.5" /> Clear filters</button>}
        </section>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.15em] text-text-muted">Library</p><h2 className="mt-1 text-2xl font-black text-text sm:text-3xl">Study materials</h2></div>
          {!isLoading && <span className="rounded-full border border-white/8 bg-white/[.03] px-3 py-1.5 text-xs font-bold text-text-muted">{filteredMaterials.length} found</span>}
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[330px] animate-pulse rounded-[24px] border border-white/5 bg-white/[.025]" />)}
          </div>
        ) : (
          <>
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></div><div><h3 className="font-extrabold text-text">Free resources</h3><p className="text-xs text-text-muted">Start learning at no cost</p></div></div>
              {filteredMaterials.filter(m => m.price === 0).length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredMaterials.filter(m => m.price === 0).map(m => <MaterialCard key={m.id} material={m} isPurchased />)}</div> : <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-text-muted">No free materials match your filters.</div>}
            </section>

            <section className="mt-12">
              <div className="mb-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><GraduationCap className="h-4 w-4" /></div><div><h3 className="font-extrabold text-text">Premium resources</h3><p className="text-xs text-text-muted">Deeper preparation and practice</p></div></div>
              {filteredMaterials.filter(m => m.price > 0).length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredMaterials.filter(m => m.price > 0).map(m => <MaterialCard key={m.id} material={m} onPreview={handlePreview} />)}</div> : <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-text-muted">No premium materials match your filters.</div>}
            </section>
          </>
        )}

        {!isLoading && filteredMaterials.length === 0 && <div className="mx-auto mt-8 max-w-lg rounded-[24px] border border-white/8 bg-white/[.025] px-5 py-12 text-center"><ShoppingCart className="mx-auto h-10 w-10 text-text-muted" /><h3 className="mt-4 text-xl font-black text-text">Nothing found</h3><p className="mt-2 text-sm text-text-muted">Try another search or clear your filters.</p><Button className="mt-5 rounded-xl bg-primary font-bold text-white" onClick={clearFilters}>Clear filters</Button></div>}
      </div>
    </main>
  )
}

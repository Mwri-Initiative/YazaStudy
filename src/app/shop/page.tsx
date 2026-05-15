'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import MaterialCard from '@/components/MaterialCard'
import { StudyMaterial } from '@/types'
import { Search, Filter, ShoppingCart, Sparkles, BookOpen, GraduationCap } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export default function ShopPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })
  const supabase = createClient()

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching materials:', error)
      } else {
        setMaterials(data || [])
        setFilteredMaterials(data || [])
      }
      setIsLoading(false)
    }

    fetchMaterials()
  }, [supabase])

  useEffect(() => {
    let filtered = materials

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(material => material.subject === selectedSubject)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType)
    }

    filtered = filtered.filter(material =>
      material.price >= priceRange.min && material.price <= priceRange.max
    )

    setFilteredMaterials(filtered)
  }, [searchTerm, selectedSubject, selectedType, priceRange, materials])

  const handlePreview = (material: StudyMaterial) => {
    window.open(material.previewUrl, '_blank')
  }

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-text-muted
    focus:outline-none focus:border-primary/60 focus:bg-primary/5 focus:ring-1 focus:ring-primary/30
    smooth-transition text-sm`

  return (
    <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full mb-4">Study Marketplace</span>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-text mb-4">
            Unlock Your <span className="text-secondary">Potential</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-body">
            Access high-quality MSCE study materials curated by experts. Browse our collection of free and premium resources.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass rounded-[40px] p-8 mb-16 border-white/10 shadow-2xl">
          <div className="grid lg:grid-cols-4 gap-6 items-end">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Search Materials</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
                <input
                  type="text"
                  placeholder="e.g. Mathematics Paper 2, Biology diagrams..."
                  className={`${inputClass} pl-11`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Subject</label>
              <select
                className={`${inputClass} appearance-none cursor-pointer`}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all" className="bg-background">All Subjects</option>
                <option value="mathematics" className="bg-background">Mathematics</option>
                <option value="physics" className="bg-background">Physics</option>
                <option value="chemistry" className="bg-background">Chemistry</option>
                <option value="biology" className="bg-background">Biology</option>
                <option value="english" className="bg-background">English</option>
                <option value="chichewa" className="bg-background">Chichewa</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Max Price: MWK {priceRange.max}</label>
              <div className="px-2 py-3.5">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Free Materials Section */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 glass rounded-2xl border-white/10">
              <Sparkles className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-text">Free Study Materials</h2>
              <p className="text-sm text-text-muted">Start learning today with zero cost</p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4 hidden md:block" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-[32px] h-[400px] animate-pulse border-white/5" />
              ))
            ) : (
              filteredMaterials.filter(m => m.price === 0).map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isPurchased={true}
                />
              ))
            )}
          </div>
          {filteredMaterials.filter(m => m.price === 0).length === 0 && (
             <div className="text-center py-12 glass rounded-3xl border-white/5 opacity-50">
                <p className="text-text-muted italic">No free materials match your filters</p>
             </div>
          )}
        </div>

        {/* Paid Materials Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 glass rounded-2xl border-white/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-text">Premium Study Guides</h2>
              <p className="text-sm text-text-muted">Unlock in-depth knowledge and practice</p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4 hidden md:block" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-[32px] h-[400px] animate-pulse border-white/5" />
              ))
            ) : (
              filteredMaterials.filter(m => m.price > 0).map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onPreview={handlePreview}
                />
              ))
            )}
          </div>
          {filteredMaterials.filter(m => m.price > 0).length === 0 && (
             <div className="text-center py-12 glass rounded-3xl border-white/5 opacity-50">
                <p className="text-text-muted italic">No premium materials match your filters</p>
             </div>
          )}
        </div>

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-20 glass rounded-[40px] border-white/10 shadow-2xl max-w-2xl mx-auto">
            <div className="bg-white/5 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-inner">
              <ShoppingCart className="h-12 w-12 text-text-muted" />
            </div>
            <h3 className="text-2xl font-bold text-text mb-4 font-display">
              No Materials Found
            </h3>
            <p className="text-text-muted max-w-sm mx-auto leading-relaxed">
              We couldn't find any materials matching your criteria. Try adjusting your search or filters.
            </p>
            <Button 
              className="mt-8 bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl font-bold"
              onClick={() => {
                setSearchTerm('')
                setSelectedSubject('all')
                setPriceRange({ min: 0, max: 5000 })
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

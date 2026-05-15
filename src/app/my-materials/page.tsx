'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudyMaterial } from '@/types'
import { Download, Eye, Search, Filter, BookOpen, Clock, Layers } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import PdfViewerModal from '@/components/PdfViewerModal'

export default function MyMaterialsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchMyMaterials = async () => {
      if (!user) return
      setIsLoading(true)

      // Fetch materials joined through user_materials table
      const { data, error } = await supabase
        .from('user_materials')
        .select(`
          purchased_at,
          materials (*)
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching materials:', error)
      } else {
        // Flatten the joined data
        const flattened = (data || [])
          .filter(item => item.materials)
          .map(item => item.materials as unknown as StudyMaterial)
        
        setMaterials(flattened)
      }
      setIsLoading(false)
    }

    if (!authLoading) {
      if (isAuthenticated) {
        fetchMyMaterials()
      } else {
        setIsLoading(false)
      }
    }
  }, [user, isAuthenticated, authLoading, supabase])

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  const handleDownload = async (material: StudyMaterial) => {
    const url = material.downloadUrl
    if (!url) {
      alert('Download link coming soon!')
      return
    }

    try {
        const fileName = url.split('/').pop()?.split('?')[0]
        if (!fileName) throw new Error('Invalid file path')

        const { data, error } = await supabase
            .storage
            .from('materials')
            .createSignedUrl(fileName, 60) // Short lived for download

        if (error) throw error
        window.open(data.signedUrl, '_blank')
    } catch (err) {
        console.error('Download error:', err)
        alert('Failed to generate secure download link.')
    }
  }

  const handlePreview = async (material: StudyMaterial) => {
    const url = material.previewUrl || material.downloadUrl
    if (!url) {
        alert('Material content not yet available.')
        return
    }

    try {
        // Extract the filename from the URL (e.g., 'math.pdf')
        const fileName = url.split('/').pop()?.split('?')[0]
        if (!fileName) throw new Error('Invalid file path')

        // Generate a Signed URL that lasts for 1 hour
        const { data, error } = await supabase
            .storage
            .from('materials')
            .createSignedUrl(fileName, 3600)

        if (error) throw error

        setActiveMaterial({
            ...material,
            previewUrl: data.signedUrl // Use the secure signed URL
        })
        setViewerOpen(true)
    } catch (err) {
        console.error('Error securing PDF access:', err)
        alert('Failed to load secure material. Please ensure you are logged in.')
    }
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
        <div className="mb-10 text-left">
          <h1 className="text-3xl md:text-5xl font-bold font-display text-text mb-4">
            My Study Materials
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl font-body">
            Your personal collection of premium MSCE resources. Ready whenever you are.
          </p>
        </div>

        {/* Filters */}
        <div className="glass rounded-3xl p-6 mb-10 border-white/10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Search Collection</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Past Papers..."
                  className={`${inputClass} pl-11`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Filter by Subject</label>
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
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-sm text-text-muted font-medium">
            Found {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} in your library
          </p>
        </div>

        {/* Materials Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-[32px] h-[300px] animate-pulse border-white/5" />
            ))}
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="glass rounded-3xl hover-lift border-white/10 group smooth-transition">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">
                      {material.subject}
                    </div>
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wider border border-green-500/20">
                      OWNED
                    </div>
                  </div>
                  <CardTitle className="text-xl font-display text-text group-hover:text-primary smooth-transition leading-tight">
                    {material.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                    {material.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-text-muted uppercase">
                    <div className="flex items-center gap-2 glass-dark rounded-xl px-3 py-2 border-white/5">
                      <Clock className="h-3 w-3 text-primary" />
                      {material.pages} Pages
                    </div>
                    <div className="flex items-center gap-2 glass-dark rounded-xl px-3 py-2 border-white/5">
                      <Layers className="h-3 w-3 text-accent" />
                      {material.difficulty}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreview(material)}
                      className="flex-1 glass border-white/10 text-text hover:bg-white/5"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
                      onClick={() => handleDownload(material)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass rounded-[40px] border-white/10 py-20 px-8 text-center max-w-2xl mx-auto shadow-2xl">
            <div className="bg-white/5 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
              <BookOpen className="h-10 w-10 text-text-muted" />
            </div>
            <h3 className="text-2xl font-bold text-text mb-3 font-display">
              Library Empty
            </h3>
            <p className="text-text-muted mb-8 leading-relaxed max-w-sm mx-auto">
              {materials.length === 0 
                ? "You haven't unlocked any premium study materials yet. Start your journey by visiting the shop."
                : "No materials match your current search or filter criteria. Try a different subject!"
              }
            </p>
            {materials.length === 0 && (
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 smooth-transition"
                onClick={() => window.location.href = '/shop'}
              >
                Browse Shop
              </Button>
            )}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {activeMaterial && (
        <PdfViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          title={activeMaterial.title}
          pdfUrl={activeMaterial.previewUrl || activeMaterial.downloadUrl || ''}
        />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  Package, 
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ListFilter,
  Layers,
  ChevronDown,
  X,
  CreditCard,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'

interface FileMetadata {
  name: string
  title: string
  description: string
  subject: string
  price: number
  difficulty: string
  pages: number
}

const SUBJECT_OPTIONS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'biology', label: 'Biology' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'english', label: 'English' },
  { value: 'chichewa', label: 'Chichewa' },
  { value: 'computer', label: 'Computer' },
  { value: 'socials', label: 'Socials' },
  { value: 'religious', label: 'Religious' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'geography', label: 'Geography' },
  { value: 'history', label: 'History' },
  { value: 'pastpaper', label: 'Pastpaper' },
  { value: 'notes', label: 'Notes' }
]

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [materials, setMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })
  
  // Mobile Responsiveness Tab
  const [activeTab, setActiveTab] = useState<'upload' | 'catalog' | 'transactions'>('catalog')

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([])
  const [txLoading, setTxLoading] = useState(false)

  const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10 MB

  // Bulk Upload File list & their metadata
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filesMetadata, setFilesMetadata] = useState<FileMetadata[]>([])

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/')
    } else if (isAdmin) {
      fetchMaterials()
      fetchTransactions()
    }
  }, [isAdmin, authLoading, router])

  const fetchMaterials = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setMaterials(data)
    setIsLoading(false)
  }

  const fetchTransactions = async () => {
    setTxLoading(true)
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        materials ( title, subject )
      `)
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setTransactions(data)
    if (error) console.error('Transactions fetch error:', error)
    setTxLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      
      if (filesArray.length + selectedFiles.length > 5) {
        setStatusMsg({ type: 'error', text: 'You can upload a maximum of 5 PDFs at once.' })
        return
      }

      const validFiles: File[] = []
      const newMetadata: FileMetadata[] = []

      for (const file of filesArray) {
        if (file.size > MAX_UPLOAD_SIZE) {
          setStatusMsg({ type: 'error', text: `File "${file.name}" is too large. Max size is 10MB.` })
          return
        }
        if (file.type !== 'application/pdf') {
          setStatusMsg({ type: 'error', text: `File "${file.name}" is not a PDF.` })
          return
        }
        
        validFiles.push(file)
        newMetadata.push({
          name: file.name,
          title: file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
          description: '',
          subject: 'mathematics',
          price: 0,
          difficulty: 'intermediate',
          pages: 0
        })
      }

      setStatusMsg({ type: '', text: '' })
      setSelectedFiles(prev => [...prev, ...validFiles])
      setFilesMetadata(prev => [...prev, ...newMetadata])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setFilesMetadata(prev => prev.filter((_, i) => i !== index))
  }

  const handleMetadataChange = (index: number, field: keyof FileMetadata, value: any) => {
    setFilesMetadata(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please select at least one PDF file to upload.' })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(5)
    setStatusMsg({ type: 'info', text: `Initiating upload of ${selectedFiles.length} file(s)...` })

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const meta = filesMetadata[i]

        const percentDone = Math.round((i / selectedFiles.length) * 100)
        setUploadProgress(percentDone)
        setStatusMsg({ 
          type: 'info', 
          text: `Uploading file ${i + 1} of ${selectedFiles.length}: "${meta.title}"...` 
        })

        const sanitizedTitle = meta.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'material'
        const fileExt = file.name.split('.').pop() || 'pdf'
        const fileName = `${sanitizedTitle}-${Date.now()}.${fileExt}`
        const filePath = `${meta.subject}/${fileName}`

        // Upload PDF to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type || 'application/pdf',
            upsert: true,
          })

        if (uploadError) throw new Error(`Upload failed for "${meta.title}": ${uploadError.message}`)

        // Get public download URL
        const { data: { publicUrl } } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath)

        // Insert database row
        const { error: dbError } = await supabase
          .from('materials')
          .insert([{
            title: meta.title.trim(),
            description: meta.description.trim(),
            subject: meta.subject,
            price: meta.price,
            type: 'pdf',
            difficulty: meta.difficulty,
            pages: meta.pages || 0,
            previewUrl: publicUrl,
            downloadUrl: publicUrl,
          }])

        if (dbError) throw new Error(`DB insert failed for "${meta.title}": ${dbError.message}`)
      }

      setUploadProgress(100)
      setStatusMsg({ type: 'success', text: `All ${selectedFiles.length} materials published successfully!` })
      setSelectedFiles([])
      setFilesMetadata([])
      fetchMaterials()
      
      // Auto switch to catalog view after brief delay
      setTimeout(() => {
        setActiveTab('catalog')
      }, 1500)

    } catch (error: any) {
      console.error('Upload process error:', error)
      setStatusMsg({ type: 'error', text: error.message || 'Failed to complete bulk uploads.' })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (!error) {
      setMaterials(materials.filter(m => m.id !== id))
    } else {
      alert(`Delete failed: ${error.message}`)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <Loader2 className="w-10 h-10 animate-spin text-[#6366f1]" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#080808]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-text-secondary max-w-md mb-8">
          You do not have administrative access. Make sure your user profile is flagged as admin in Supabase.
        </p>
        <Button onClick={() => router.push('/')} className="bg-primary text-white font-bold">
          Back to Home
        </Button>
      </div>
    )
  }

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text placeholder-text-muted
    focus:outline-none focus:border-primary/60 focus:bg-primary/5 focus:ring-1 focus:ring-primary/30
    smooth-transition text-xs`

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Title & Stats Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black font-display text-white tracking-tight">Admin Control Room</h1>
          <p className="text-text-muted text-sm mt-1.5">Manage study catalog, review uploads, and monitor files.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial glass px-4 py-2.5 rounded-2xl border-white/10 flex items-center gap-3">
            <Package className="text-primary w-5 h-5" />
            <div>
              <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest leading-none">Catalog Size</div>
              <div className="text-base font-bold text-white mt-1">{materials.length} Items</div>
            </div>
          </div>
          <div className="flex-1 sm:flex-initial glass px-4 py-2.5 rounded-2xl border-white/10 flex items-center gap-3">
            <DollarSign className="text-secondary w-5 h-5" />
            <div>
              <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest leading-none">Premium Guides</div>
              <div className="text-base font-bold text-secondary mt-1">{materials.filter(m => m.price > 0).length} Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector for Small Screens (< lg) */}
      <div className="flex lg:hidden mb-6 bg-white/5 p-1 rounded-2xl border border-white/5 relative z-10">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl smooth-transition ${
            activeTab === 'upload' ? 'bg-[#6366f1] text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text'
          }`}
        >
          Bulk Upload ({selectedFiles.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl smooth-transition ${
            activeTab === 'catalog' ? 'bg-[#6366f1] text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text'
          }`}
        >
          Catalog ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl smooth-transition ${
            activeTab === 'transactions' ? 'bg-[#6366f1] text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* Upload Container */}
        <div className={`lg:col-span-1 ${activeTab === 'upload' ? 'block' : 'hidden lg:block'}`}>
          <Card className="glass border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Plus className="text-primary w-5 h-5" />
                Add & Publish PDFs
              </CardTitle>
              <CardDescription className="text-text-muted text-xs">
                Upload up to 5 PDFs at once and configure their details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* File Dropzone Input - Show when under 5 files */}
              {selectedFiles.length < 5 && (
                <div className="relative group">
                  <input 
                    type="file" 
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={isSubmitting}
                  />
                  <div className="border-2 border-dashed border-white/10 group-hover:border-primary/50 rounded-2xl p-6 text-center smooth-transition bg-white/5">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-text-muted group-hover:scale-110 smooth-transition" />
                    <p className="text-xs font-bold text-white">Select or Drag PDF files</p>
                    <p className="text-[10px] text-text-muted mt-1 leading-none">Max 5 files • PDF format • Under 10MB each</p>
                  </div>
                </div>
              )}

              {/* Upload Status / Message Block */}
              {statusMsg.text && (
                <div className={`p-4 rounded-xl flex flex-col gap-2.5 text-xs ${
                  statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  <div className="flex items-center gap-2">
                    {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : 
                     statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
                     <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                    <span className="font-semibold leading-tight">{statusMsg.text}</span>
                  </div>
                  {isSubmitting && (
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mt-1">
                      <div className="h-full rounded-full bg-[#6366f1] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Files Configurator */}
              {selectedFiles.length > 0 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-text-muted border-b border-white/5 pb-2 flex justify-between items-center">
                    <span>Selected Files ({selectedFiles.length}/5)</span>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedFiles([]); setFilesMetadata([]); setStatusMsg({ type: '', text: '' }) }} 
                      className="text-red-400 hover:underline capitalize font-medium text-[10px]"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                    {filesMetadata.map((meta, idx) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 relative group">
                        
                        {/* Remove File Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-3 right-3 text-text-muted hover:text-red-400 smooth-transition"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 mr-6 min-w-0">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <p className="text-[10px] text-text-muted truncate font-bold uppercase tracking-wide leading-none">{meta.name}</p>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Material Title</label>
                          <input 
                            type="text" required
                            className={inputClass}
                            value={meta.title}
                            onChange={e => handleMetadataChange(idx, 'title', e.target.value)}
                            placeholder="e.g. Mathematics Paper 1"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Description</label>
                          <textarea 
                            className={`${inputClass} min-h-[60px] resize-none`}
                            value={meta.description}
                            onChange={e => handleMetadataChange(idx, 'description', e.target.value)}
                            placeholder="Brief details about the resource content..."
                          />
                        </div>

                        {/* Dropdowns / Numbers Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Subject</label>
                            <select 
                              className={inputClass}
                              value={meta.subject}
                              onChange={e => handleMetadataChange(idx, 'subject', e.target.value)}
                            >
                              {SUBJECT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-[#121215]">{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Price (MWK)</label>
                            <input 
                              type="number"
                              className={inputClass}
                              value={meta.price}
                              onChange={e => handleMetadataChange(idx, 'price', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Difficulty</label>
                            <select 
                              className={inputClass}
                              value={meta.difficulty}
                              onChange={e => handleMetadataChange(idx, 'difficulty', e.target.value)}
                            >
                              <option value="basic" className="bg-[#121215]">Basic</option>
                              <option value="intermediate" className="bg-[#121215]">Intermediate</option>
                              <option value="advanced" className="bg-[#121215]">Advanced</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Pages count</label>
                            <input 
                              type="number"
                              className={inputClass}
                              value={meta.pages}
                              onChange={e => handleMetadataChange(idx, 'pages', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-bold py-4 rounded-xl shadow-lg smooth-transition"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing {selectedFiles.length} PDF(s)...
                      </>
                    ) : (
                      `Publish ${selectedFiles.length} Material(s)`
                    )}
                  </Button>
                </form>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Catalog Registry List */}
        <div className={`lg:col-span-2 space-y-6 ${activeTab === 'catalog' ? 'block' : 'hidden lg:block'}`}>
          <Card className="glass border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Material</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 smooth-transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                            <FileText className="w-5 h-5 text-text-muted" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white truncate max-w-[220px]">{m.title}</div>
                            <div className="text-xs text-text-muted mt-0.5">{m.pages || 0} Pages • {m.difficulty}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#6366f1]/10 text-[#6366f1] text-[10px] font-bold uppercase tracking-wider">
                          {m.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-white">
                        {m.price === 0 ? <span className="text-green-400 font-extrabold">FREE</span> : `MWK ${m.price.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 border border-white/5 text-red-400 hover:bg-red-500/10 rounded-xl smooth-transition"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-text-muted italic text-sm">
                        No materials found in the catalog.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid */}
            <div className="block md:hidden p-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
              {materials.map((m) => (
                <div key={m.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-3 shadow-inner">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                      <FileText className="w-5 h-5 text-text-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-white truncate leading-tight">{m.title}</p>
                      <p className="text-[11px] text-text-muted mt-1 leading-none">{m.pages || 0} Pages • {m.difficulty}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-2.5 mt-0.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#6366f1]/10 text-[#6366f1] text-[9px] font-bold uppercase tracking-wider">
                      {m.subject}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white">
                        {m.price === 0 ? <span className="text-green-400 font-extrabold">FREE</span> : `MWK ${m.price.toLocaleString()}`}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 border border-white/5 text-red-400 hover:bg-red-500/10 rounded-xl smooth-transition"
                        onClick={() => handleDelete(m.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {materials.length === 0 && (
                <div className="text-center py-16 text-text-muted italic text-xs">
                  No materials found in the catalog.
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* ── Transactions Tab (Full width below) ────────────────────────────── */}
      <div className={`mt-8 relative z-10 ${activeTab === 'transactions' ? 'block' : 'hidden lg:block'}`}>
        
        {/* Desktop: always show as third section */}
        <div className={`hidden lg:block`}>
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-white">Transactions</h2>
            <button onClick={fetchTransactions} className="ml-auto text-xs text-text-muted hover:text-primary smooth-transition font-bold">↻ Refresh</button>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        {(() => {
          const successful = transactions.filter(t => t.status === 'success')
          const pending = transactions.filter(t => t.status === 'pending')
          const totalRevenue = successful.reduce((sum, t) => sum + (t.amount || 0), 0)
          const uniqueUsers = new Set(successful.map(t => t.user_id).filter(Boolean)).size
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass px-4 py-3 rounded-2xl border-white/10 flex items-center gap-3">
                <TrendingUp className="text-green-400 w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest">Total Revenue</div>
                  <div className="text-base font-black text-green-400">MWK {totalRevenue.toLocaleString()}</div>
                </div>
              </div>
              <div className="glass px-4 py-3 rounded-2xl border-white/10 flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest">Successful</div>
                  <div className="text-base font-black text-white">{successful.length}</div>
                </div>
              </div>
              <div className="glass px-4 py-3 rounded-2xl border-white/10 flex items-center gap-3">
                <Clock className="text-secondary w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest">Pending</div>
                  <div className="text-base font-black text-white">{pending.length}</div>
                </div>
              </div>
              <div className="glass px-4 py-3 rounded-2xl border-white/10 flex items-center gap-3">
                <Users className="text-accent w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest">Paying Users</div>
                  <div className="text-base font-black text-white">{uniqueUsers}</div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Transactions Table */}
        <Card className="glass border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
          {txLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-text-muted italic text-sm">
              No transactions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Reference</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Material</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Amount</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Method</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t) => {
                    const statusColors: Record<string, string> = {
                      success: 'bg-green-500/10 text-green-400 border border-green-500/20',
                      pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
                      failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
                    }
                    const statusColor = statusColors[t.status] || 'bg-white/5 text-text-muted border border-white/10'
                    return (
                      <tr key={t.id} className="hover:bg-white/5 smooth-transition">
                        <td className="px-5 py-4">
                          <span className="font-mono text-[10px] text-text-muted truncate max-w-[120px] block">
                            {t.transaction_id?.slice(0, 20) || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs font-bold text-white truncate max-w-[140px]">
                            {t.materials?.title || <span className="italic text-text-muted">Unknown</span>}
                          </div>
                          {t.materials?.subject && (
                            <div className="text-[9px] text-text-muted capitalize mt-0.5">{t.materials.subject}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 font-bold text-sm text-white">
                          MWK {(t.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-text-muted capitalize">{t.payment_method?.replace(/_/g, ' ') || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-text-muted">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          }) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  )
}

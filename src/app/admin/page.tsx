'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  TrendingUp, 
  Package, 
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [materials, setMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'mathematics',
    price: 0,
    type: 'pdf',
    difficulty: 'intermediate',
    pages: 0,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/')
    } else if (isAdmin) {
      fetchMaterials()
    }
  }, [isAdmin, authLoading, router])

  const fetchMaterials = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (data) setMaterials(data)
    setIsLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setStatusMsg({ type: 'error', text: 'Please select a PDF file to upload.' })
      return
    }

    setIsSubmitting(true)
    setStatusMsg({ type: 'info', text: 'Uploading material...' })

    try {
      // 1. Upload File to Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, selectedFile, {
            upsert: true
        })

      if (uploadError) throw uploadError

      // 2. Get Public URL (or path for signed URLs)
      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath)

      // 3. Create Database Record
      const { error: dbError } = await supabase
        .from('materials')
        .insert([{
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          price: formData.price,
          type: formData.type,
          difficulty: formData.difficulty,
          pages: formData.pages,
          previewUrl: publicUrl,
          downloadUrl: publicUrl,
        }])

      if (dbError) throw dbError

      setStatusMsg({ type: 'success', text: 'Material uploaded successfully!' })
      setFormData({
        title: '',
        description: '',
        subject: 'mathematics',
        price: 0,
        type: 'pdf',
        difficulty: 'intermediate',
        pages: 0,
      })
      setSelectedFile(null)
      fetchMaterials()
    } catch (error: any) {
      console.error('Upload error:', error)
      setStatusMsg({ type: 'error', text: error.message || 'Failed to upload material.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (!error) {
      setMaterials(materials.filter(m => m.id !== id))
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Access Denied</h1>
        <p className="text-text-muted max-w-md mb-8">
          You do not have permission to access the admin dashboard. 
          Please make sure you have run the SQL to set your account as an admin.
        </p>
        <Button onClick={() => router.push('/')} className="bg-primary">
          Back to Home
        </Button>
      </div>
    )
  }

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-text-muted
    focus:outline-none focus:border-primary/60 focus:bg-primary/5 focus:ring-1 focus:ring-primary/30
    smooth-transition text-sm`

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold font-display text-text">Admin Dashboard</h1>
          <p className="text-text-secondary mt-2">Manage your study materials and library.</p>
        </div>
        <div className="flex gap-3">
            <div className="glass px-4 py-2 rounded-2xl border-white/10 flex items-center gap-3">
                <Package className="text-primary w-5 h-5" />
                <div>
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Total Items</div>
                    <div className="text-lg font-bold">{materials.length}</div>
                </div>
            </div>
            <div className="glass px-4 py-2 rounded-2xl border-white/10 flex items-center gap-3">
                <DollarSign className="text-secondary w-5 h-5" />
                <div>
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Premium</div>
                    <div className="text-lg font-bold">{materials.filter(m => m.price > 0).length}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Upload Form */}
        <Card className="lg:col-span-1 glass border-white/10 rounded-[32px] h-fit">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Plus className="text-primary w-5 h-5" />
              Add New Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Title</label>
                <input 
                  type="text" required
                  className={inputClass}
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Mathematics Paper 1"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  className={`${inputClass} min-h-[100px]`}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description of the material..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Subject</label>
                  <select 
                    className={inputClass}
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="mathematics">Mathematics</option>
                    <option value="biology">Biology</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="english">English</option>
                    <option value="chichewa">Chichewa</option>
                    <option value="computer">Computer</option>
                    <option value="socials">Socials</option>
                    <option value="religious">Religious</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="geography">Geography</option>
                    <option value="history">History</option>
                    <option value="home-economics">Home Economics</option>
                    <option value="civic">Civic</option>
                    <option value="economics">Economics</option>
                    <option value="general-paper">General Paper</option>
                    <option value="business-studies">Business Studies</option>
                    <option value="french">French</option>
                    <option value="philosophy">Philosophy</option>
                    <option value="pastpaper">Pastpaper</option>
                    <option value="notes">Notes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Price (MWK)</label>
                  <input 
                    type="number"
                    className={inputClass}
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                  />
                  <p className="text-[10px] text-text-muted mt-1">Set to 0 for Free</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Difficulty</label>
                  <select 
                    className={inputClass}
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Pages</label>
                  <input 
                    type="number"
                    className={inputClass}
                    value={formData.pages}
                    onChange={e => setFormData({...formData, pages: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">PDF File</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`
                    border-2 border-dashed rounded-2xl p-6 text-center smooth-transition
                    ${selectedFile ? 'border-primary bg-primary/5' : 'border-white/10 group-hover:border-white/20'}
                  `}>
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-primary' : 'text-text-muted'}`} />
                    <p className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : 'Click or drag PDF to upload'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">MAX SIZE: 10MB</p>
                  </div>
                </div>
              </div>

              {statusMsg.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : 
                   statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   <Loader2 className="w-4 h-4 animate-spin" />}
                  {statusMsg.text}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-2xl shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Publish Material'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Materials List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass border-white/10 rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Material</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 smooth-transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-text-muted" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-text">{m.title}</div>
                            <div className="text-xs text-text-muted">{m.pages} Pages • {m.difficulty}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase">
                          {m.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">
                        {m.price === 0 ? <span className="text-green-400">FREE</span> : `MWK ${m.price}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 border-white/10 text-red-400 hover:bg-red-400/10 hover:border-red-400/20"
                            onClick={() => handleDelete(m.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-muted italic">
                        No materials uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

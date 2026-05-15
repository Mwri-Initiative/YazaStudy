'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudyMaterial } from '@/types'
import { Loader2, CreditCard, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck, Mail, User, Phone } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const sampleMaterials: StudyMaterial[] = [
  {
    id: '1',
    title: 'MSCE Mathematics Complete Study Guide',
    description: 'Comprehensive mathematics guide covering all MSCE topics with worked examples and past papers',
    subject: 'mathematics',
    price: 2500,
    type: 'pdf',
    pages: 120,
    difficulty: 'intermediate',
    duration: '6 months'
  },
  {
    id: '2',
    title: 'MSCE Biology Complete Study Guide',
    description: 'Complete biology guide with diagrams, practical exercises and exam preparation',
    subject: 'biology',
    price: 3000,
    type: 'pdf',
    pages: 150,
    difficulty: 'intermediate',
    duration: '6 months'
  }
]

function PaymentFinalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const [material, setMaterial] = useState<StudyMaterial | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    const materialId = searchParams.get('id')
    if (materialId) {
      const foundMaterial = sampleMaterials.find(m => m.id === materialId)
      setMaterial(foundMaterial || null)
    }

    if (user) {
      const names = user.name.split(' ')
      setFormData(prev => ({
        ...prev,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [searchParams, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!material) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const reference = `MSCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const paymentData = {
        amount: material.price,
        currency: 'MWK',
        email: formData.email,
        phone: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
        tx_ref: reference,
        callback_url: `${window.location.origin}/api/payment/webhook`,
        return_url: `${window.location.origin}/payment/success?tx_ref=${reference}&materialId=${material.id}`
      }

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (result.success && result.data?.checkout_url) {
        setSuccess('Payment initiated! Redirecting...')
        setTimeout(() => {
          window.location.href = result.data.checkout_url
        }, 1500)
      } else {
        setError(result.error || 'Payment initiation failed')
      }
    } catch (error) {
      setError('Network error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-text-muted
    focus:outline-none focus:border-primary/60 focus:bg-primary/5 focus:ring-1 focus:ring-primary/30
    smooth-transition text-sm`

  if (!material && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="group text-text-muted hover:text-primary p-0 h-auto mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 smooth-transition" />
              Back
            </Button>
            <h1 className="text-3xl font-bold font-display text-text">Final Step</h1>
          </div>
          <div className="flex items-center gap-3 glass px-4 py-2 rounded-2xl border-white/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-text-secondary">PayChangu Secure</span>
          </div>
        </div>

        {material && (
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left Column: Material Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass rounded-3xl border-white/10 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardHeader>
                  <CardTitle className="text-2xl font-display">{material.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-text-secondary text-sm leading-relaxed">{material.description}</p>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Total Price</span>
                      <span className="text-3xl font-bold text-secondary">MWK {material.price.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Payment Form */}
            <div className="lg:col-span-3">
              <Card className="glass rounded-3xl border-white/10 shadow-2xl overflow-hidden">
                <CardHeader className="pb-2 text-center">
                   <div className="flex justify-center mb-4">
                    <Image 
                      src="/mwiri-logo.png" 
                      alt="Mwiri" 
                      width={60} 
                      height={60}
                      className="rounded-full shadow-lg"
                    />
                  </div>
                  <CardTitle className="text-xl font-display">Confirm Purchase</CardTitle>
                  <CardDescription className="text-text-muted">
                    Ready to proceed with your payment?
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {error && (
                    <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="mb-6 flex items-center gap-2 bg-green-500/10 border border-green-200 rounded-2xl px-4 py-3">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      <span className="text-green-400 text-sm">{success}</span>
                    </div>
                  )}

                  <form onSubmit={handlePayment} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`${inputClass} pl-10`}
                          placeholder="First Name"
                          required
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`${inputClass} pl-10`}
                          placeholder="Last Name"
                          required
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`${inputClass} pl-10`}
                        placeholder="Email Address"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`${inputClass} pl-10`}
                        placeholder="Phone (Airtel/TNM)"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isProcessing || !!success}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-accent/90
                          text-white font-bold py-4 rounded-2xl smooth-transition hover:scale-[1.02] hover:shadow-xl
                          hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Processing...
                          </>
                        ) : success ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                            Confirm Payment
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentFinalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <PaymentFinalContent />
    </Suspense>
  )
}

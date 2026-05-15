'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudyMaterial } from '@/types'
import { Loader2, CreditCard, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck, Mail, User, Phone, BookOpen } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

import { createClient } from '@/lib/supabase/client'

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const supabase = createClient()
  
  const [material, setMaterial] = useState<StudyMaterial | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    const fetchMaterial = async (id: string) => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching material:', error)
        setError('Material not found')
      } else {
        setMaterial(data)
      }
    }

    const materialId = searchParams.get('materialId') || searchParams.get('id')
    if (materialId) {
      fetchMaterial(materialId)
    }

    // Pre-fill user data if available
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
  }, [searchParams, user, supabase])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!material) return

    if (!validateForm()) {
      setError('Please fix the errors above')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const reference = `MSCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const paymentData = {
        amount: material.price,
        currency: 'MWK',
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        tx_ref: reference,
        callback_url: `${window.location.origin}/api/payment/webhook`,
        return_url: `${window.location.origin}/payment/success?tx_ref=${reference}&materialId=${material.id}`,
        description: `Purchase: ${material.title}`
      }

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (result.success && result.data?.checkout_url) {
        setSuccess('Payment initiated! Redirecting...')
        localStorage.setItem('lastPaymentReference', reference)
        localStorage.setItem('lastMaterialId', material.id)
        setTimeout(() => {
          window.location.href = result.data.checkout_url
        }, 1500)
      } else {
        setError(result.error || 'Payment initiation failed. Please try again.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error occurred.')
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
              Back to Shop
            </Button>
            <h1 className="text-3xl font-bold font-display text-text">Checkout</h1>
          </div>
          <div className="flex items-center gap-3 glass px-4 py-2 rounded-2xl border-white/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-text-secondary">Secure Payment via PayChangu</span>
          </div>
        </div>

        {error && !material && (
          <div className="glass rounded-3xl p-12 text-center border border-red-500/20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-2">Oops!</h2>
            <p className="text-text-muted mb-8">{error}</p>
            <Button onClick={() => router.push('/shop')} className="bg-primary hover:bg-primary/90 text-white">
              Back to Shop
            </Button>
          </div>
        )}

        {material && (
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left Column: Material Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass rounded-3xl border-white/10 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardHeader>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2 w-fit uppercase">
                    {material.subject}
                  </div>
                  <CardTitle className="text-2xl font-display">{material.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-text-secondary text-sm leading-relaxed">{material.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-dark rounded-2xl p-3 border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Format</p>
                      <p className="text-sm font-semibold text-text uppercase">{material.type}</p>
                    </div>
                    <div className="glass-dark rounded-2xl p-3 border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Difficulty</p>
                      <p className="text-sm font-semibold text-text capitalize">{material.difficulty}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">What's Included</h4>
                    <ul className="space-y-2">
                      {[
                        'Full MSCE curriculum coverage',
                        'Instant download after payment',
                        'Lifetime access to this material',
                        'Practice questions & solutions'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Price</span>
                      <span className="text-3xl font-bold text-secondary">MWK {material.price.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods Image/Logos */}
              <div className="glass rounded-3xl p-6 border-white/10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Supported Payments</p>
                <div className="flex flex-wrap justify-center gap-4">
                   <div className="px-3 py-2 glass-dark rounded-xl border-white/5 text-[10px] font-bold text-text-secondary">Airtel Money</div>
                   <div className="px-3 py-2 glass-dark rounded-xl border-white/5 text-[10px] font-bold text-text-secondary">TNM Mpamba</div>
                   <div className="px-3 py-2 glass-dark rounded-xl border-white/5 text-[10px] font-bold text-text-secondary">Visa / Mastercard</div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="lg:col-span-3">
              <Card className="glass rounded-3xl border-white/10 shadow-2xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-display flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Personal Details
                  </CardTitle>
                  <CardDescription className="text-text-muted">
                    Information used to deliver your materials
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
                    <div className="mb-6 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      <span className="text-green-400 text-sm">{success}</span>
                    </div>
                  )}

                  <form onSubmit={handlePayment} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`${inputClass} pl-10 ${validationErrors.firstName ? 'border-red-500/50' : ''}`}
                            placeholder="John"
                            disabled={isProcessing || !!success}
                          />
                        </div>
                        {validationErrors.firstName && <p className="text-red-400 text-[10px] mt-1 ml-1">{validationErrors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`${inputClass} pl-10 ${validationErrors.lastName ? 'border-red-500/50' : ''}`}
                            placeholder="Doe"
                            disabled={isProcessing || !!success}
                          />
                        </div>
                        {validationErrors.lastName && <p className="text-red-400 text-[10px] mt-1 ml-1">{validationErrors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`${inputClass} pl-10 ${validationErrors.email ? 'border-red-500/50' : ''}`}
                          placeholder="john@example.com"
                          disabled={isProcessing || !!success}
                        />
                      </div>
                      {validationErrors.email && <p className="text-red-400 text-[10px] mt-1 ml-1">{validationErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`${inputClass} pl-10 ${validationErrors.phone ? 'border-red-500/50' : ''}`}
                          placeholder="+265..."
                          disabled={isProcessing || !!success}
                        />
                      </div>
                      {validationErrors.phone && <p className="text-red-400 text-[10px] mt-1 ml-1">{validationErrors.phone}</p>}
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
                            Securely Processing...
                          </>
                        ) : success ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Payment Ready
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                            Pay MWK {material.price.toLocaleString()}
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-text-muted leading-relaxed px-4">
                      By proceeding, you agree to our terms. Your transaction is encrypted and secured by 
                      <span className="text-primary font-bold ml-1">PayChangu</span>.
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 glass p-4 rounded-2xl border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text">Secure Access</p>
                    <p className="text-[10px] text-text-muted leading-tight">SSL encrypted connection</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 glass p-4 rounded-2xl border-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text">Full Support</p>
                    <p className="text-[10px] text-text-muted leading-tight">Help with your materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}

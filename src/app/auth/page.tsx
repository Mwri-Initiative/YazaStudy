'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { User, Lock, Phone, Mail, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

function AuthForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login, register, isAuthenticated, isLoading } = useAuth()

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  // If already logged in redirect
  useEffect(() => {
    if (isAuthenticated) router.push('/')
  }, [isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const switchMode = (login: boolean) => {
    setIsLogin(login)
    setError('')
    setSuccess('')
    setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password)
        if (!result.success) {
          setError(result.error || 'Login failed.')
        } else {
          setSuccess('Welcome back! Redirecting...')
          setTimeout(() => router.push('/'), 800)
        }
      } else {
        const result = await register(formData.name, formData.email, formData.password, formData.phone || undefined)
        if (!result.success) {
          setError(result.error || 'Registration failed.')
        } else {
          setSuccess('Account created! Redirecting...')
          setTimeout(() => router.push('/'), 800)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-text-muted
    focus:outline-none focus:border-primary/60 focus:bg-primary/5 focus:ring-1 focus:ring-primary/30
    smooth-transition text-sm`

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-6 smooth-transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 smooth-transition" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4 relative">
            <div className="absolute inset-0 glow-primary rounded-2xl" />
            <Image
              src="/mwiri-logo.png"
              alt="Yaza Stuff"
              width={40}
              height={40}
              className="h-10 w-auto relative z-10 rounded-xl"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-text mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-text-muted text-sm">
            {isLogin
              ? 'Sign in to access your purchased materials'
              : 'Join thousands of MSCE students on Yaza Stuff'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-7">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold smooth-transition ${
                isLogin ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold smooth-transition ${
                !isLogin ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${inputClass} pl-10`}
                    placeholder="e.g. Chinamwiri Hopeson"
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Phone Number <span className="normal-case font-normal text-text-muted/60">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${inputClass} pl-10`}
                    placeholder="+265 XXX XXX XXX"
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 pr-10`}
                  placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text smooth-transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="Repeat your password"
                    required={!isLogin}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text smooth-transition"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password (login only) */}
            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-xs text-primary hover:text-secondary smooth-transition">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-accent/90
                text-white font-semibold py-3 rounded-xl smooth-transition hover:scale-[1.02] hover:shadow-lg
                hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Terms */}
          {!isLogin && (
            <p className="text-center text-xs text-text-muted mt-4">
              By registering you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          )}
        </div>

        {/* Benefits row */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🔒', text: 'Secure Login' },
            { icon: '⚡', text: 'Instant Access' },
            { icon: '📚', text: 'All Subjects' },
          ].map(b => (
            <div key={b.text} className="glass rounded-xl py-2.5 px-1">
              <div className="text-lg mb-0.5">{b.icon}</div>
              <div className="text-xs text-text-muted">{b.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <AuthForm />
    </Suspense>
  )
}

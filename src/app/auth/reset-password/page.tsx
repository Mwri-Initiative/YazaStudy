'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkingRecovery, setCheckingRecovery] = useState(true)
  const [recoveryReady, setRecoveryReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const checkRecoverySession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (!mounted) return

      if (sessionError || !session) {
        setRecoveryReady(false)
        setError('This password reset link is invalid or has expired. Please request a new reset link.')
      } else {
        setRecoveryReady(true)
        setError('')
      }
      setCheckingRecovery(false)
    }

    checkRecoverySession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session) {
        setRecoveryReady(true)
        setError('')
      }
      setCheckingRecovery(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-text placeholder-text-muted focus:outline-none focus:border-primary/60 focus:bg-primary/5 focus:ring-1 focus:ring-primary/30 smooth-transition text-sm'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!recoveryReady) {
      setError('Your reset session is not valid. Please request a new reset link.')
      return
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess('Your password has been updated. Please sign in with your new password.')
      setPassword('')
      setConfirmPassword('')
      await supabase.auth.signOut()
      window.setTimeout(() => router.replace('/auth'), 1400)
    } catch (err: any) {
      setError(err?.message || 'Could not update your password. Please request a new reset link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <section className="relative w-full max-w-md">
        <Link href="/auth" className="flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>

        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 text-primary mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Set a new password</h1>
            <p className="text-sm text-text-muted">Choose a new password for your Yaza Study account.</p>
          </div>

          {error && <div role="alert" className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
          {success && <div role="status" className="mb-5 flex gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm"><CheckCircle className="h-4 w-4 shrink-0" />{success}</div>}

          {checkingRecovery ? (
            <p role="status" className="py-4 text-center text-sm text-text-muted">Verifying your secure reset link...</p>
          ) : !recoveryReady ? (
            <Link href="/auth" className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white hover:bg-primary/90">
              Return to sign in
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input id="new-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={inputClass + ' pr-11'} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required />
                  <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input id="confirm-password" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass + ' pr-11'} placeholder="Enter the new password again" autoComplete="new-password" minLength={8} required />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>

              <button type="submit" disabled={submitting || !!success} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

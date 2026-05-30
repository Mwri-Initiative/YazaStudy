'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  CheckCircle2,
  ArrowRight,
  Home,
  BookOpen,
  Star,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { useAuth } from '../../../lib/auth-context'

// ─── Confetti helper ─────────────────────────────────────────────────────────
function launchConfetti() {
  const duration = 4 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) return clearInterval(interval)
    const particleCount = 50 * (timeLeft / duration)
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
  }, 250)
}

// ─── Main Content ─────────────────────────────────────────────────────────────
const PaymentSuccessContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const tx_ref = searchParams?.get('tx_ref')
  const materialId = searchParams?.get('materialId')

  type VerifyState = 'loading' | 'success' | 'error'
  const [verifyState, setVerifyState] = useState<VerifyState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [resolvedMaterialId, setResolvedMaterialId] = useState(materialId)

  useEffect(() => {
    if (!tx_ref) {
      setVerifyState('error')
      setErrorMsg('No transaction reference found. If you completed payment, please contact support.')
      return
    }

    let cancelled = false

    const verifyAndGrant = async () => {
      try {
        const res = await fetch('/api/payment/grant-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tx_ref,
            materialId,
            userId: user?.id,
          }),
        })

        const data = await res.json()
        if (cancelled) return

        if (data.success) {
          setResolvedMaterialId(data.materialId || materialId)
          setVerifyState('success')
          launchConfetti()
        } else {
          setVerifyState('error')
          setErrorMsg(data.error || 'Payment verification failed. Please contact support.')
        }
      } catch {
        if (!cancelled) {
          setVerifyState('error')
          setErrorMsg('Network error while verifying payment. Please contact support.')
        }
      }
    }

    verifyAndGrant()
    return () => { cancelled = true }
  }, [tx_ref, materialId, user])

  // ── Loading State ────────────────────────────────────────────────────────
  if (verifyState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary"
        />
        <div className="text-center">
          <p className="text-lg font-bold text-white mb-1">Verifying your payment…</p>
          <p className="text-sm text-text-muted">This only takes a moment. Please don't close this page.</p>
        </div>
      </div>
    )
  }

  // ── Error State ──────────────────────────────────────────────────────────
  if (verifyState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="glass-dark rounded-[48px] p-8 md:p-14 text-center border border-red-500/20 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)]">
            <div className="relative mb-8 inline-block">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-black font-display text-white mb-4">
              Payment Not Confirmed
            </h1>
            <p className="text-text-muted mb-2 leading-relaxed">{errorMsg}</p>
            {tx_ref && (
              <p className="text-[11px] font-mono text-text-muted/60 mb-8">
                Ref: {tx_ref}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-2xl"
                onClick={() => router.push('/shop')}
              >
                Back to Shop
              </Button>
              <Link
                href="mailto:support@yazastuff.com"
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Success State ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-dark rounded-[48px] p-8 md:p-16 text-center border border-white/10 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 10 }}
            className="relative mb-10 inline-block"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight">
              Payment <span className="text-primary">Successful!</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 font-medium">
              Thank you for choosing <span className="text-white font-bold">Yaza Stuff</span>. Your study materials are now unlocked and ready to access.
            </p>
          </motion.div>

          {/* Transaction Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass bg-white/5 rounded-3xl p-6 mb-10 border border-white/5 text-left"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Transaction Ref</p>
                  <p className="text-sm font-mono text-text-secondary">{tx_ref}</p>
                </div>
              </div>
              <span className="hidden sm:block px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                Verified ✓
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary fill-secondary" />
                <span className="text-xs text-text-muted font-medium">Premium Access Granted</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs text-text-muted font-medium">MSCE Curriculum</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 smooth-transition hover:scale-[1.02] font-black py-7 text-lg rounded-2xl group"
              onClick={() => {
                if (resolvedMaterialId) {
                  router.push(`/my-materials?focus=${resolvedMaterialId}`)
                } else {
                  router.push('/my-materials')
                }
              }}
            >
              Access My Materials
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 smooth-transition" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass text-white border-white/10 hover:bg-white/5 smooth-transition font-bold py-7 px-8 rounded-2xl"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-5 w-5" />
              Back Home
            </Button>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-text-muted text-sm font-medium"
        >
          Having trouble?{' '}
          <Link href="mailto:support@yazastuff.com" className="text-primary hover:underline">
            Contact Support
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-text-muted text-sm font-medium">Loading…</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}

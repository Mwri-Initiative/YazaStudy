'use client'


import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CheckCircle2, Download, ArrowRight, Home, BookOpen, Star, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PaymentSuccessContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tx_ref = searchParams.get('tx_ref')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Trigger confetti
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
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
          {/* Animated Glow behind Icon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
            className="relative mb-10 inline-block"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight">
              Payment <span className="text-primary">Successful!</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 font-medium">
              Thank you for choosing <span className="text-white font-bold">Yaza Stuff</span>. Your study materials are now available in your account.
            </p>
          </motion.div>

          {/* Transaction Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass bg-white/5 rounded-3xl p-6 mb-10 border border-white/5 text-left"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Transaction Ref</p>
                  <p className="text-sm font-mono text-text-secondary">{tx_ref || 'PAY-TRANS-CONFIRMED'}</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                  Verified
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary fill-secondary" />
                <span className="text-xs text-text-muted font-medium">Premium Access</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs text-text-muted font-medium">MSCE Curriculum</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 smooth-transition hover:scale-[1.02] font-black py-7 text-lg rounded-2xl group"
              onClick={() => router.push('/my-materials')}
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
          </div>
        </div>

        {/* Support Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-text-muted text-sm font-medium"
        >
          Having trouble? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
        </motion.p>
      </motion.div>
    </div>

  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SubjectCard from '@/components/SubjectCard'
import { Subject } from '@/types'
import { Star, Users, Zap, ArrowRight, BookOpen, Shield, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { motion, AnimatePresence } from 'framer-motion'

const subjects: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Complete MSCE mathematics study materials with past papers and solutions',
    icon: '∑',
    color: '#2196F3'
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Comprehensive physics notes, experiments, and practice questions',
    icon: '⚛',
    color: '#2E8B57'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    description: 'Detailed chemistry notes, formulas, and practical guides',
    icon: '⚗',
    color: '#FFC107'
  },
  {
    id: 'biology',
    name: 'Biology',
    description: 'Complete biology study materials with diagrams and illustrations',
    icon: '🧬',
    color: '#4CAF50'
  },
  {
    id: 'english',
    name: 'English Language',
    description: 'Grammar, literature, and composition study guides',
    icon: '📝',
    color: '#9C27B0'
  },
  {
    id: 'chichewa',
    name: 'Chichewa',
    description: 'Chichewa language and literature comprehensive materials',
    icon: '📖',
    color: '#FF5722'
  }
]

const stats = [
  { value: '5,000+', label: 'Students Enrolled' },
  { value: '200+', label: 'Study Materials' },
  { value: '6', label: 'MSCE Subjects' },
  { value: '98%', label: 'Pass Rate' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="relative min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-50" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-50" />
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="mb-10 inline-block">
              <div className="relative group">
                <div className="absolute inset-[-8px] bg-gradient-to-r from-secondary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                <Image
                  src="/mwiri-logo.png"
                  alt="Mwiri Logo"
                  width={120}
                  height={120}
                  className="h-32 w-auto relative z-10 rounded-full shadow-2xl border-4 border-white/20"
                />
              </div>
            </motion.div>

            {/* Greeting if logged in */}
            {isAuthenticated && (
              <motion.div variants={itemVariants} className="mb-6">
                <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full text-secondary text-sm font-bold shadow-lg border border-white/20">
                  <span className="animate-bounce">👋</span> Welcome back, {user?.name.split(' ')[0]}!
                </div>
              </motion.div>
            )}

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 font-display text-white leading-[1.1] tracking-tight"
            >
              Master Your{' '}
              <span className="text-secondary drop-shadow-[0_4px_12px_rgba(255,193,7,0.4)]">MSCE</span> Exams
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto font-heading font-medium leading-relaxed"
            >
              Unlock your potential with premium study materials tailored for <span className="text-secondary border-b-2 border-secondary/30">Malawi students</span>.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Button
                size="lg"
                className="bg-secondary text-primary hover:bg-white hover:text-primary hover:scale-105 shadow-2xl shadow-secondary/20 smooth-transition font-black px-10 py-7 text-lg group rounded-2xl"
                onClick={() => router.push('/shop')}
              >
                Browse Materials
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 smooth-transition" />
              </Button>
              {!isAuthenticated ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="glass text-white hover:bg-white/20 hover:scale-105 smooth-transition border-2 border-white/30 font-bold px-10 py-7 text-lg rounded-2xl"
                  onClick={() => router.push('/auth')}
                >
                  Get Started Free
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="glass text-white hover:bg-white/20 hover:scale-105 smooth-transition border-2 border-white/30 font-bold px-10 py-7 text-lg rounded-2xl"
                  onClick={() => router.push('/my-materials')}
                >
                  <BookOpen className="mr-2 h-6 w-6" />
                  My Materials
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative -mt-12 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-dark rounded-[40px] grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-3xl"
          >
            {stats.map((s, i) => (
              <div key={s.label} className="py-10 text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-3xl md:text-4xl font-black text-secondary font-display mb-2 tracking-tighter"
                >
                  {s.value}
                </motion.div>
                <div className="text-sm text-text-muted font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-32 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-block text-xs font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20"
            >
              The Yaza Edge
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-text mb-6 tracking-tight"
            >
              Built for <span className="text-primary">Success</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xl text-text-secondary max-w-2xl mx-auto font-medium"
            >
              Everything you need to excel in your exams, delivered with precision and care.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <CheckCircle2 className="h-10 w-10 text-primary" />,
                color: 'primary',
                title: 'Quality Content',
                description: 'Expert-curated notes following the MSCE syllabus perfectly.'
              },
              {
                icon: <Zap className="h-10 w-10 text-accent" />,
                color: 'accent',
                title: 'Instant Delivery',
                description: 'Get your study materials in seconds with automated delivery.'
              },
              {
                icon: <Star className="h-10 w-10 text-secondary" />,
                color: 'secondary',
                title: 'Affordable Pricing',
                description: 'Premium education made accessible for every Malawi student.'
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                color: 'primary',
                title: 'Proven Results',
                description: 'Join over 5,000 students who improved their grades with us.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-dark hover:border-primary/50 text-center p-4 group h-full flex flex-col items-center justify-center border-white/5 smooth-transition rounded-[32px]">
                  <CardHeader>
                    <div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 smooth-transition border border-white/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-black text-text mb-4">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-text-muted text-base font-medium leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects ── */}
      <section className="py-24 relative bg-white/5 rounded-[60px] mx-4 md:mx-10 mb-20 border border-white/5 shadow-inner">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-block text-xs font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-4 py-2 rounded-full mb-6 border border-secondary/20"
              >
                Catalog
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-display tracking-tight"
              >
                Explore <span className="gradient-text-primary">Subjects</span>
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                className="text-secondary font-black hover:text-white hover:bg-secondary/10 px-6 py-6 text-lg rounded-2xl group"
                onClick={() => router.push('/shop')}
              >
                View All Catalog
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 smooth-transition" />
              </Button>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <SubjectCard key={subject.id} subject={subject} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Auth CTA ── */}
      {!isAuthenticated && (
        <section className="py-32 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-[48px] p-12 md:p-20 text-center border-2 border-primary/20 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/30">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-display text-text mb-6 tracking-tight">
                  Start Your Journey <span className="text-primary">Today</span>
                </h2>
                <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto font-medium">
                  Create a free account to track your study materials, get exclusive updates, and join the Yaza community.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 smooth-transition hover:scale-105 font-black px-12 py-8 text-xl rounded-2xl"
                    onClick={() => router.push('/auth?mode=register')}
                  >
                    Register Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="glass text-text border-white/20 hover:bg-white/10 smooth-transition font-black px-12 py-8 text-xl rounded-2xl"
                    onClick={() => router.push('/auth')}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden mx-4 md:mx-10 rounded-[60px] mb-20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-black mb-8 text-white font-display tracking-tight"
          >
            Ready to Ace Your <span className="text-secondary underline decoration-secondary/30">MSCE</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl mb-12 text-white/90 font-medium"
          >
            High-quality study guides for Malawian students.
          </motion.p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-secondary hover:text-primary hover:scale-110 shadow-2xl smooth-transition px-16 py-9 text-2xl font-black group rounded-2xl"
            onClick={() => router.push('/shop')}
          >
            Shop Now
            <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-3 smooth-transition" />
          </Button>
        </div>
      </section>
    </div>
  )
}

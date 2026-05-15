'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Subject } from '@/types'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface SubjectCardProps {
  subject: Subject
  index?: number
}

export default function SubjectCard({ subject, index = 0 }: SubjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="glass rounded-[32px] hover:shadow-2xl hover:shadow-primary/20 group smooth-transition border-white/10 overflow-hidden h-full flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-center space-x-5">
            <div 
              className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 group-hover:rotate-3 smooth-transition shadow-2xl relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 smooth-transition" />
               <div className="relative z-10" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                 {subject.icon}
               </div>
               <div className="absolute inset-0" style={{ backgroundColor: subject.color, opacity: 0.9 }} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-display text-text group-hover:text-primary smooth-transition">
                {subject.name}
              </CardTitle>
              <CardDescription className="text-text-muted group-hover:text-text-secondary smooth-transition font-body text-xs line-clamp-2 mt-1">
                {subject.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-auto pt-4">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 smooth-transition group h-12 rounded-2xl overflow-hidden relative"
            onClick={() => window.location.href = `/shop?subject=${subject.id}`}
          >
            <motion.div 
              className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
            />
            <span className="relative z-10">Browse Materials</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 smooth-transition relative z-10" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

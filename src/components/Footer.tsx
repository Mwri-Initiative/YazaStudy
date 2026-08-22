'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, BookOpen, ChevronRight, Mail, MessageCircle, Sparkles } from 'lucide-react'

type FooterLink = {
  label: string
  href: string
  badge?: string
  external?: boolean
}

type FooterGroup = {
  title: string
  links: FooterLink[]
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/emmanuel.chinamwiri', icon: 'f' },
  { name: 'X', href: 'https://x.com/manzychinamwiri', icon: '𝕏' },
  { name: 'Instagram', href: 'https://instagram.com/manzychinamwiri', icon: '◎' },
  { name: 'WhatsApp', href: 'https://wa.me/265980851937', icon: '◉' },
  { name: 'YouTube', href: 'https://www.youtube.com/@manzychinamwiri', icon: '▶' },
  { name: 'TikTok', href: 'https://tiktok.com/@MwiriWrld', icon: '♪' },
]

const footerGroups: FooterGroup[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'AI Tutor', href: '/ai-tutor', badge: 'AI' },
      { label: 'Study Shop', href: '/shop' },
      { label: 'My Materials', href: '/my-materials' },
    ],
  },
  {
    title: 'Subjects',
    links: [
      { label: 'Mathematics', href: '/shop?subject=mathematics' },
      { label: 'Physics', href: '/shop?subject=physics' },
      { label: 'Chemistry', href: '/shop?subject=chemistry' },
      { label: 'Biology', href: '/shop?subject=biology' },
      { label: 'English', href: '/shop?subject=english' },
      { label: 'Chichewa', href: '/shop?subject=chichewa' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: 'mailto:emmanuelchinamwiri@gmail.com' },
      { label: 'WhatsApp Support', href: 'https://wa.me/265980851937', external: true },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/[0.08] bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="mb-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute -inset-2 rounded-2xl bg-primary/20 blur-lg" />
                <Image src="/mwiri-side-logo.png" alt="Yaza Study" width={52} height={52} className="relative h-12 w-12 rounded-2xl object-cover sm:h-14 sm:w-14" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-xl font-extrabold tracking-tight text-text sm:text-2xl">Yaza<span className="text-primary">Study</span></h2>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-primary">Learn better</span>
                </div>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-text-secondary sm:text-[15px]">Learn, practice and excel with study resources built for students in Malawi.</p>
              </div>
            </div>

            <Link href="/ai-tutor" className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-white shadow-lg shadow-primary/20 smooth-transition hover:-translate-y-0.5 hover:bg-primary-dark">
              <Sparkles className="h-4 w-4" />
              Try AI Tutor
              <ArrowUpRight className="h-4 w-4 smooth-transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="max-w-sm">
              <div className="mb-3 flex items-center gap-2.5"><BookOpen className="h-5 w-5 text-primary" /><span className="text-sm font-extrabold uppercase tracking-[0.16em] text-text">Study smarter</span></div>
              <p className="text-sm leading-6 text-text-muted">Quality learning materials, useful tools and a growing study experience designed around how students actually learn.</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} title={social.name} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-sm font-bold text-text-muted smooth-transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:text-primary">{social.icon}</a>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 text-xs text-text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">
              <a href="mailto:emmanuelchinamwiri@gmail.com" className="inline-flex items-center gap-2 hover:text-text smooth-transition"><Mail className="h-3.5 w-3.5" />Contact the team</a>
              <a href="https://wa.me/265980851937" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-text smooth-transition"><MessageCircle className="h-3.5 w-3.5" />WhatsApp support</a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-text">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined} className="group inline-flex min-h-8 items-center gap-1.5 text-sm text-text-muted smooth-transition hover:text-text">
                      <ChevronRight className="-ml-1 h-3.5 w-3.5 opacity-0 smooth-transition group-hover:ml-0 group-hover:opacity-100 group-hover:text-primary" />
                      <span>{link.label}</span>
                      {link.badge && <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-extrabold text-primary">{link.badge}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.08] pt-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Yaza Study. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-text smooth-transition">Privacy</Link>
            <span className="h-1 w-1 rounded-full bg-text-muted/50" aria-hidden="true" />
            <Link href="/terms" className="hover:text-text smooth-transition">Terms</Link>
            <span className="h-1 w-1 rounded-full bg-text-muted/50" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">Made for Malawi <span aria-hidden="true">🇲🇼</span></span>
          </div>
        </div>
      </div>
    </footer>
  )
}

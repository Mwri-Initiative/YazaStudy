'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, LogOut, BookOpen, ChevronDown, Menu, X, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '../lib/auth-context'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/ai-tutor', label: 'AI Tutor' },
  { href: '/shop', label: 'Study Shop' },
  { href: '/my-materials', label: 'My Materials' },
]

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    router.push('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : ''

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-5 pt-3 sm:pt-4">
      <div className="glass mx-auto max-w-7xl rounded-2xl sm:rounded-3xl border border-white/10">
        <div className="flex min-h-14 sm:min-h-16 items-center justify-between gap-2 px-3 sm:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3 group">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-primary/25 blur-md opacity-0 group-hover:opacity-100 smooth-transition" />
              <Image src="/mwiri-side-logo.png" alt="Yaza Study" width={38} height={38} className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
            </div>
            <div className="min-w-0 leading-none">
              <span className="block truncate text-base sm:text-lg font-extrabold font-heading text-text">Yaza<span className="text-primary">Study</span></span>
              <span className="hidden xs:block text-[9px] sm:text-[10px] font-semibold uppercase tracking-[.16em] text-text-muted">Learn • Practice • Excel</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`rounded-xl px-3.5 py-2 text-sm font-semibold smooth-transition ${active ? 'bg-primary/12 text-primary' : 'text-text-secondary hover:bg-white/5 hover:text-text'}`}>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl text-text-secondary hover:bg-white/5 hover:text-text" onClick={() => router.push('/shop')} aria-label="Open study shop">
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(v => !v)} className="glass flex items-center gap-2 rounded-xl px-2 py-1.5 hover:border-primary/30 smooth-transition" aria-label="Open account menu">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-extrabold text-white">{initials}</div>
                  <span className="max-w-[90px] truncate text-sm font-semibold text-text-secondary">{user?.name.split(' ')[0]}</span>
                  <ChevronDown className={`h-4 w-4 text-text-muted smooth-transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 glass rounded-2xl border border-white/10 p-1.5 shadow-2xl animate-dropdown">
                    <div className="px-3 py-2.5 border-b border-white/10">
                      <p className="truncate text-sm font-bold text-text">{user?.name}</p>
                      <p className="truncate text-xs text-text-muted">{user?.email}</p>
                    </div>
                    <Link href="/my-materials" onClick={() => setDropdownOpen(false)} className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-secondary hover:bg-primary/10 hover:text-primary"><BookOpen className="h-4 w-4" /> My Materials</Link>
                    <Link href="/shop" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-secondary hover:bg-accent/10 hover:text-accent"><ShoppingCart className="h-4 w-4" /> Study Shop</Link>
                    {isAdmin && <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 rounded-xl border-t border-white/10 px-3 py-2.5 text-sm font-bold text-primary"><ShieldCheck className="h-4 w-4" /> Admin Panel</Link>}
                    <button onClick={handleLogout} className="mt-1 w-full flex items-center gap-3 rounded-xl border-t border-white/10 px-3 py-2.5 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="rounded-xl font-semibold text-text-secondary hover:text-text" onClick={() => router.push('/auth')}>Sign In</Button>
                <Button size="sm" className="rounded-xl bg-primary px-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark" onClick={() => router.push('/auth?mode=register')}>Get Started</Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="md:hidden rounded-xl border border-white/10 bg-white/[.04]" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-3 pb-3 pt-2 animate-dropdown">
            <div className="grid gap-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href} className={`flex min-h-11 items-center rounded-xl px-3.5 text-sm font-bold ${pathname === item.href ? 'bg-primary/12 text-primary' : 'text-text-secondary hover:bg-white/5'}`}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-2 border-t border-white/10 pt-2">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3.5 text-left text-sm font-semibold text-red-400"><LogOut className="h-4 w-4" /> Sign Out</button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" className="rounded-xl text-text-secondary" onClick={() => router.push('/auth')}>Sign In</Button>
                  <Button className="rounded-xl bg-primary text-white" onClick={() => router.push('/auth?mode=register')}><Sparkles className="mr-1.5 h-4 w-4" /> Join Free</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

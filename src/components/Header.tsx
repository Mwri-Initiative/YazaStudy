'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, User, LogOut, BookOpen, ChevronDown, Menu, X, ShieldCheck } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/ai-tutor', label: 'AI Tutor' },
  { href: '/shop', label: 'Shop' },
  { href: '/my-materials', label: 'My Materials' },
]

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
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
    <header className="glass sticky top-0 z-50 smooth-transition border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group smooth-transition">
            <div className="relative floating">
              <div className="absolute inset-0 glow-primary rounded-full opacity-0 group-hover:opacity-100 smooth-transition" />
              <Image
                src="/mwiri-side-logo.png"
                alt="Mwiri Side Logo"
                width={36}
                height={36}
                className="h-9 w-auto relative z-10 rounded-full"
              />
            </div>
            <span className="text-xl font-bold font-heading text-primary group-hover:text-secondary smooth-transition">
              Yaza Stuff
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-heading smooth-transition relative group
                    ${active
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-primary hover:bg-white/5'
                    }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="glass hover:glow-accent smooth-transition group relative hidden sm:flex"
              onClick={() => router.push('/shop')}
              title="Shop"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 smooth-transition" />
            </Button>

            {/* Auth area */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl hover:glow-primary smooth-transition group"
                  title="Account"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-text-secondary max-w-[100px] truncate">
                    {user?.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-text-muted smooth-transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-dropdown">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-text truncate">{user?.name}</p>
                      <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>
                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/my-materials"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-primary/10 smooth-transition"
                      >
                        <BookOpen className="h-4 w-4" />
                        My Materials
                      </Link>
                      <Link
                        href="/shop"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-accent/10 smooth-transition"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Shop
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary/10 smooth-transition font-bold border-t border-white/10"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 smooth-transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-primary hover:bg-white/5 smooth-transition font-medium"
                  onClick={() => router.push('/auth')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white hover:scale-105 smooth-transition font-semibold px-4"
                  onClick={() => router.push('/auth?mode=register')}
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden glass smooth-transition"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/10 px-4 py-4 space-y-1 animate-dropdown">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium smooth-transition
                ${pathname === item.href
                  ? 'text-primary bg-primary/10'
                  : 'text-text-secondary hover:text-primary hover:bg-white/5'
                }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl smooth-transition"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-text-secondary"
                  onClick={() => router.push('/auth')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-white"
                  onClick={() => router.push('/auth?mode=register')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

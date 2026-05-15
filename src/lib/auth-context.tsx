'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const mapSupabaseUser = useCallback((supabaseUser: any): User => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
      email: supabaseUser.email || '',
      phone: supabaseUser.user_metadata?.phone || '',
      avatar: supabaseUser.user_metadata?.avatar_url || '',
      createdAt: supabaseUser.created_at,
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Fetch additional profile data (like is_admin)
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()

          setUser({
            ...mapSupabaseUser(session.user),
            isAdmin: profile?.is_admin || false
          })
        }
      } catch (error) {
        console.error('Error loading auth session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()

          setUser({
            ...mapSupabaseUser(session.user),
            isAdmin: profile?.is_admin || false
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        if (session?.user) setUser(mapSupabaseUser(session.user))
      } finally {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, mapSupabaseUser])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user))
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred.' }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, mapSupabaseUser])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user))
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred.' }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, mapSupabaseUser])

  const logout = useCallback(async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setIsLoading(false)
    router.push('/')
  }, [supabase, router])
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user, 
      isAdmin: user?.isAdmin || false,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  hasMounted: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasMounted: false,
})

// Single Supabase client instance
const supabase = createClient()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthContext] Fetching initial user...')
        }
        // Use getUser() instead of getSession() - it validates the JWT with Supabase
        // and is more reliable for detecting sessions set by server actions
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          // getUser() returns an error if no session exists, which is normal
          if (process.env.NODE_ENV === 'development') {
            console.log('[AuthContext] getUser result:', error.message)
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[AuthContext] Initial user result: ${currentUser?.email || 'No user'}`)
        }
        
        if (mounted) {
          setUser(currentUser || null)
          setLoading(false)
          setHasMounted(true)
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[AuthContext] Failed to initialize session:', err)
        }
        if (mounted) {
          setLoading(false)
          setHasMounted(true)
        }
      }
    }
    
    initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[AuthContext] Auth Event: ${event} | User: ${session?.user?.email || 'None'}`)
        }
        if (mounted) {
          setUser(session?.user || null)
          setLoading(false)
        }
      }
    )

    // Also check session when tab becomes visible (handles redirect scenarios)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && mounted) {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (mounted) {
          setUser(currentUser || null)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, hasMounted }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

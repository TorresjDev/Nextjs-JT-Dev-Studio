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
        console.log('[AuthContext] Fetching initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[AuthContext] getSession error:', error.message)
        }
        
        console.log(`[AuthContext] Initial session result: ${session?.user?.email || 'No session'}`)
        
        if (mounted) {
          setUser(session?.user || null)
          setLoading(false)
          setHasMounted(true)
        }
      } catch (err) {
        console.error('[AuthContext] Failed to initialize session:', err)
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
        console.log(`[AuthContext] Auth Event: ${event} | User: ${session?.user?.email || 'None'}`)
        if (mounted) {
          setUser(session?.user || null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
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

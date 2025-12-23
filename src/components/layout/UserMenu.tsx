'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { signout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { 
  LogOut, 
  User as UserIcon, 
  ChevronDown,
  Github
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

// Supabase client for sign out action
const supabase = createClient()

export default function UserMenu({ 
  showName = true, 
  dropdownPlacement = "top",
  dropdownAlign = "right"
}: { 
  showName?: boolean,
  dropdownPlacement?: "top" | "bottom"
  dropdownAlign?: "left" | "right"
}) {
  // Use shared auth context - all UserMenu instances share the same state!
  const { user, loading, hasMounted } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    setIsOpen(false)
    console.log('[UserMenu] User clicked Log Out')
    // Clear client-side session
    await supabase.auth.signOut()
    // Trigger server-side logout and redirect
    await signout()
  }

  // Show loading skeleton on server render and until session is fetched
  // This prevents hydration mismatch by rendering the same thing on server and initial client
  if (!hasMounted || loading) {
    return (
      <div className="flex items-center gap-2 p-1">
        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        {showName && <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />}
      </div>
    )
  }

  if (!user) {
    return (
      <Button asChild variant="ghost" className="text-[#DAA520] hover:text-[#DAA520]/80">
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0]
  const isGithub = user.app_metadata?.provider === 'github'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors group"
      >
        <div className="relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="User"
              width={32}
              height={32}
              className="rounded-full border border-[#DAA520]/20 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-[#DAA520]/20">
              <UserIcon className="w-4 h-4 text-[#DAA520]" />
            </div>
          )}
          {isGithub && (
            <div className="absolute -bottom-1 -right-1 bg-[#24292e] rounded-full p-0.5 border border-white/20">
              <Github className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        {showName && (
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-xs font-bold text-white/90 leading-none">{displayName}</span>
            <span className="text-[10px] text-white/40 leading-none mt-1">Logged in</span>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropdownPlacement === "top" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPlacement === "top" ? 10 : -10, scale: 0.95 }}
            className={cn(
              "absolute w-56 max-w-[calc(100vw-2rem)] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-100",
              dropdownPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2",
              dropdownAlign === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="px-3 py-2 border-b border-white/5 mb-2">
              <p className="text-xs font-medium text-white/40 mb-1">Signed in as</p>
              <p className="text-sm font-bold text-white truncate">{user.email}</p>
            </div>
            
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all group"
            >
              <UserIcon className="w-4 h-4 group-hover:text-[#DAA520] transition-colors" />
              <span className="text-sm font-medium">Profile Details</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all group mt-1 text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

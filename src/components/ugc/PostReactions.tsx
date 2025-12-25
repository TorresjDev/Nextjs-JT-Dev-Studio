'use client'

/**
 * Post Reactions Component
 * 
 * Displays emoji reaction buttons (👍 ❤️ 🔥) that users can click to react.
 * Shows the count for each reaction type.
 */

import { useState, useTransition, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { 
  toggleReaction, 
  getPostReactions, 
  getUserReactions,
} from '@/lib/ugc/reactions'
import {
  type ReactionType,
  type ReactionCount,
  REACTION_EMOJIS 
} from '@/lib/ugc/reaction-types'

interface PostReactionsProps {
  postId: string
  initialCounts?: ReactionCount[]
  initialUserReactions?: ReactionType[]
}

const REACTION_TYPES: ReactionType[] = ['like', 'love', 'fire']

export function PostReactions({ 
  postId, 
  initialCounts = [],
  initialUserReactions = []
}: PostReactionsProps) {
  const { user } = useAuth()
  const [isPending, startTransition] = useTransition()
  
  const [counts, setCounts] = useState<Record<ReactionType, number>>(() => {
    const initial: Record<ReactionType, number> = { like: 0, love: 0, fire: 0 }
    for (const count of initialCounts) {
      initial[count.reaction_type] = count.count
    }
    return initial
  })
  
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(
    new Set(initialUserReactions)
  )

  // Fetch reactions on mount if not provided
  useEffect(() => {
    async function fetchReactions() {
      const [reactionCounts, userReacts] = await Promise.all([
        getPostReactions(postId),
        getUserReactions(postId),
      ])
      
      const newCounts: Record<ReactionType, number> = { like: 0, love: 0, fire: 0 }
      for (const count of reactionCounts) {
        newCounts[count.reaction_type] = count.count
      }
      setCounts(newCounts)
      setUserReactions(new Set(userReacts))
    }
    
    fetchReactions()
  }, [postId])

  const handleReaction = (reactionType: ReactionType) => {
    if (!user) {
      // Redirect to login or show message
      window.location.href = '/login'
      return
    }

    // Optimistic update
    const hadReaction = userReactions.has(reactionType)
    
    setUserReactions(prev => {
      const next = new Set(prev)
      if (hadReaction) {
        next.delete(reactionType)
      } else {
        next.add(reactionType)
      }
      return next
    })
    
    setCounts(prev => ({
      ...prev,
      [reactionType]: hadReaction ? prev[reactionType] - 1 : prev[reactionType] + 1
    }))

    // Server update
    startTransition(async () => {
      const result = await toggleReaction(postId, reactionType)
      if (!result.success) {
        // Revert optimistic update on error
        setUserReactions(prev => {
          const next = new Set(prev)
          if (hadReaction) {
            next.add(reactionType)
          } else {
            next.delete(reactionType)
          }
          return next
        })
        setCounts(prev => ({
          ...prev,
          [reactionType]: hadReaction ? prev[reactionType] + 1 : prev[reactionType] - 1
        }))
      }
    })
  }

  return (
    <div className="flex items-center gap-2 py-4 border-t border-border">
      {REACTION_TYPES.map((type) => {
        const isActive = userReactions.has(type)
        const count = counts[type]
        
        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isPending}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200 disabled:opacity-50
              ${isActive 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent hover:border-border'
              }
            `}
            title={`${type.charAt(0).toUpperCase() + type.slice(1)} (${count})`}
          >
            <span className="text-base">{REACTION_EMOJIS[type]}</span>
            {count > 0 && (
              <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

'use server'

/**
 * Server Actions for Post Reactions
 * 
 * Handles adding/removing emoji reactions (👍 ❤️ 🔥) to posts.
 * Note: Types and constants are in reaction-types.ts since 'use server' can only export async functions.
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { ReactionType, ReactionCount } from './reaction-types'

/**
 * Get reaction counts for a post
 */
export async function getPostReactions(postId: string): Promise<ReactionCount[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type')
    .eq('post_id', postId)
  
  if (error || !data) {
    return []
  }
  
  // Count reactions by type
  const counts: Record<string, number> = {}
  for (const reaction of data) {
    counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1
  }
  
  return Object.entries(counts).map(([reaction_type, count]) => ({
    reaction_type: reaction_type as ReactionType,
    count,
  }))
}

/**
 * Get current user's reactions on a post
 */
export async function getUserReactions(postId: string): Promise<ReactionType[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
  
  if (error || !data) {
    return []
  }
  
  return data.map(r => r.reaction_type as ReactionType)
}

/**
 * Toggle a reaction on a post
 * If the user already reacted with this type, remove it
 * Otherwise, add the reaction
 */
export async function toggleReaction(
  postId: string, 
  reactionType: ReactionType
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'You must be logged in to react' }
  }
  
  // Check if reaction already exists
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('reaction_type', reactionType)
    .single()
  
  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from('post_reactions')
      .delete()
      .eq('id', existing.id)
    
    if (error) {
      console.error('Error removing reaction:', error)
      return { success: false, error: 'Failed to remove reaction' }
    }
  } else {
    // Add reaction
    const { error } = await supabase
      .from('post_reactions')
      .insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: reactionType,
      })
    
    if (error) {
      console.error('Error adding reaction:', error)
      return { success: false, error: 'Failed to add reaction' }
    }
  }
  
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

/**
 * Reaction Types and Constants
 * 
 * Shared types for post reactions.
 * Separated from server actions because 'use server' files can only export async functions.
 */

// Reaction types
export type ReactionType = 'like' | 'love' | 'fire'

// Emoji mapping
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  fire: '🔥',
}

// Types
export interface ReactionCount {
  reaction_type: ReactionType
  count: number
}

export interface UserReaction {
  reaction_type: ReactionType
}

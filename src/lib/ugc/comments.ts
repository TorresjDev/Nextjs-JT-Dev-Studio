'use server'

/**
 * Server Actions for Comments
 * 
 * Handles CRUD (Create, Read, Update, Delete) operations for comments.
 * Comments support threading via parent_comment_id.
 * 
 * Threading = Replies to comments, creating a tree structure
 * Parent comment = The comment being replied to
 * Top-level comment = A comment with no parent (direct comment on post)
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createCommentSchema, updateCommentSchema, safeParse } from './schemas'
import type { 
  Comment, 
  CommentWithAuthor, 
  CommentThread,
  CreateCommentInput, 
  UpdateCommentInput 
} from './types'
import type { ActionResult } from './posts'

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the currently authenticated user's ID
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Require authentication
 */
async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('You must be logged in to perform this action')
  }
  return userId
}

// =============================================================================
// Comment Actions
// =============================================================================

/**
 * Create a new comment on a post
 * 
 * @param input - The comment data (post_id, content, optional parent_comment_id)
 * @returns The created comment or an error
 */
export async function createComment(
  input: CreateCommentInput
): Promise<ActionResult<Comment>> {
  try {
    const userId = await requireAuth()
    
    // Validate input
    const validation = safeParse(createCommentSchema, input)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: validation.data.post_id,
        author_id: userId,
        parent_comment_id: validation.data.parent_comment_id ?? null,
        content: validation.data.content,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating comment:', error)
      // RLS prevents commenting on non-published posts
      return { success: false, error: 'Failed to create comment. The post may not be published.' }
    }
    
    // Revalidate the post page to show the new comment
    revalidatePath(`/posts/${input.post_id}`)
    
    return { success: true, data: data as Comment }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Update an existing comment
 * 
 * @param commentId - The ID of the comment to update
 * @param input - The new content
 * @returns The updated comment or an error
 */
export async function updateComment(
  commentId: string,
  input: UpdateCommentInput
): Promise<ActionResult<Comment>> {
  try {
    await requireAuth()
    
    // Validate input
    const validation = safeParse(updateCommentSchema, input)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('comments')
      .update({
        content: validation.data.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select('*, post_id')
      .single()
    
    if (error) {
      console.error('Error updating comment:', error)
      return { success: false, error: 'Failed to update comment. You may not have permission.' }
    }
    
    revalidatePath(`/posts/${data.post_id}`)
    
    return { success: true, data: data as Comment }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Delete a comment
 * 
 * @param commentId - The ID of the comment to delete
 * @param postId - The post ID (for revalidation)
 * @returns Success or error
 */
export async function deleteComment(
  commentId: string,
  postId: string
): Promise<ActionResult<null>> {
  try {
    await requireAuth()
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    
    if (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: 'Failed to delete comment. You may not have permission.' }
    }
    
    revalidatePath(`/posts/${postId}`)
    
    return { success: true, data: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Get all comments for a post (flat list with author info)
 * 
 * @param postId - The ID of the post
 * @returns List of comments with author data
 */
export async function getComments(postId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!author_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  
  return data as CommentWithAuthor[]
}

/**
 * Get comments as a threaded tree structure
 * 
 * This converts flat comments into nested replies:
 * - Top-level comments (no parent) are at the root
 * - Replies are nested under their parent comments
 * 
 * @param postId - The ID of the post
 * @returns Threaded comments with nested replies
 */
export async function getThreadedComments(postId: string): Promise<CommentThread[]> {
  const comments = await getComments(postId)
  
  // Build a map of comment ID -> CommentThread
  const commentMap = new Map<string, CommentThread>()
  
  // First pass: Create all comment objects with empty replies arrays
  for (const comment of comments) {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    })
  }
  
  // Second pass: Build the tree by adding replies to their parents
  const rootComments: CommentThread[] = []
  
  for (const comment of comments) {
    const threadComment = commentMap.get(comment.id)!
    
    if (comment.parent_comment_id) {
      // This is a reply - add it to the parent's replies array
      const parent = commentMap.get(comment.parent_comment_id)
      if (parent) {
        parent.replies.push(threadComment)
      } else {
        // Parent not found (shouldn't happen with FK constraint)
        // Treat as root comment
        rootComments.push(threadComment)
      }
    } else {
      // This is a top-level comment
      rootComments.push(threadComment)
    }
  }
  
  return rootComments
}

/**
 * Get comment count for a post
 * 
 * @param postId - The ID of the post
 * @returns The number of comments
 */
export async function getCommentCount(postId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  
  if (error) {
    console.error('Error counting comments:', error)
    return 0
  }
  
  return count ?? 0
}

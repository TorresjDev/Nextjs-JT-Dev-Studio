'use server'

/**
 * Server Actions for Posts
 * 
 * Server Actions = Functions that run on the server, called directly from React components
 * They're the Next.js 13+ way to handle form submissions and data mutations.
 * 
 * Benefits:
 * - Type-safe from client to server
 * - Automatic request handling (no API routes needed)
 * - RLS (Row-Level Security) enforced via Supabase session
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createPostSchema, updatePostSchema, safeParse } from './schemas'
import type { 
  Post, 
  PostWithAuthor, 
  CreatePostInput, 
  UpdatePostInput,
  PaginatedResponse,
  PaginationParams 
} from './types'

// =============================================================================
// Types for Action Results
// =============================================================================

/**
 * Standard result type for server actions
 * Either succeeds with data, or fails with an error message
 */
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the currently authenticated user's ID
 * Returns null if not authenticated
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Require authentication - throws if not logged in
 */
async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('You must be logged in to perform this action')
  }
  return userId
}

/**
 * Ensure a profile exists for the user
 * Creates one automatically if it doesn't exist (for users who signed up before the trigger was added)
 * 
 * This pulls data from Supabase auth user metadata (which includes GitHub profile info for OAuth users)
 */
async function ensureProfileExists(userId: string): Promise<void> {
  const supabase = await createClient()
  
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()
  
  if (existingProfile) {
    return // Profile already exists
  }
  
  // Get user metadata from auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  // Extract profile info from user metadata
  // GitHub OAuth provides: user_name, avatar_url, full_name, etc.
  const metadata = user.user_metadata || {}
  const username = metadata.user_name || metadata.preferred_username || user.email?.split('@')[0] || null
  const displayName = metadata.full_name || metadata.name || null
  const avatarUrl = metadata.avatar_url || null
  const bio = metadata.bio || null
  
  // Create the profile
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username,
      display_name: displayName,
      avatar_url: avatarUrl,
      bio,
    })
  
  if (error) {
    console.error('Error creating profile:', error)
    // Don't throw - we'll let the post creation handle the error
  } else {
    console.log('Auto-created profile for user:', userId)
  }
}

// =============================================================================
// Post Actions
// =============================================================================

/**
 * Create a new post
 * 
 * @param input - The post data (title, content, category, status)
 * @returns The created post or an error
 */
export async function createPost(input: CreatePostInput): Promise<ActionResult<Post>> {
  try {
    const userId = await requireAuth()
    
    // Ensure profile exists before creating post
    await ensureProfileExists(userId)
    
    // Validate input using Zod schema
    const validation = safeParse(createPostSchema, input)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        title: validation.data.title,
        content: validation.data.content,
        category: validation.data.category,
        status: validation.data.status,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating post:', error)
      return { success: false, error: 'Failed to create post' }
    }
    
    // Revalidate the posts page to show the new post
    revalidatePath('/posts')
    
    return { success: true, data: data as Post }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Update an existing post
 * 
 * @param postId - The ID of the post to update
 * @param input - The fields to update
 * @returns The updated post or an error
 */
export async function updatePost(
  postId: string, 
  input: UpdatePostInput
): Promise<ActionResult<Post>> {
  try {
    await requireAuth()
    
    // Validate input
    const validation = safeParse(updatePostSchema, input)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const supabase = await createClient()
    
    // Build update object only with provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (validation.data.title !== undefined) updateData.title = validation.data.title
    if (validation.data.content !== undefined) updateData.content = validation.data.content
    if (validation.data.category !== undefined) updateData.category = validation.data.category
    if (validation.data.status !== undefined) updateData.status = validation.data.status
    
    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating post:', error)
      // RLS will prevent updating others' posts, show generic message
      return { success: false, error: 'Failed to update post. You may not have permission.' }
    }
    
    revalidatePath('/posts')
    revalidatePath(`/posts/${postId}`)
    
    return { success: true, data: data as Post }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Delete a post
 * 
 * @param postId - The ID of the post to delete
 * @returns Success or error
 */
export async function deletePost(postId: string): Promise<ActionResult<null>> {
  try {
    await requireAuth()
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
    
    if (error) {
      console.error('Error deleting post:', error)
      return { success: false, error: 'Failed to delete post. You may not have permission.' }
    }
    
    revalidatePath('/posts')
    
    return { success: true, data: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Get a single post by ID (with author info)
 * 
 * @param postId - The ID of the post
 * @returns The post with author data or null if not found
 */
export async function getPost(postId: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data as PostWithAuthor
}

/**
 * Get paginated list of published posts (for the feed)
 * Uses cursor-based pagination for efficiency
 * 
 * Cursor = A pointer to a specific position in the list
 * Instead of "page 5", we say "everything after this timestamp"
 * 
 * @param params - Pagination parameters (cursor, limit)
 * @returns Paginated list of posts
 */
export async function getPosts(
  params: PaginationParams = {}
): Promise<PaginatedResponse<PostWithAuthor>> {
  const { cursor, limit = 10 } = params
  const supabase = await createClient()
  
  // Build query
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit + 1) // Fetch one extra to check if there are more
  
  // Apply cursor (if provided)
  if (cursor) {
    // Cursor format: "timestamp_id" (e.g., "2024-01-01T00:00:00Z_uuid")
    const [cursorDate, cursorId] = cursor.split('_')
    query = query.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching posts:', error)
    return { data: [], nextCursor: null, hasMore: false }
  }
  
  // Check if there are more results
  const hasMore = data.length > limit
  const posts = hasMore ? data.slice(0, limit) : data
  
  // Generate next cursor from the last item
  let nextCursor: string | null = null
  if (hasMore && posts.length > 0) {
    const lastPost = posts[posts.length - 1]
    nextCursor = `${lastPost.created_at}_${lastPost.id}`
  }
  
  return {
    data: posts as PostWithAuthor[],
    nextCursor,
    hasMore,
  }
}

/**
 * Get the current user's posts (including drafts)
 * 
 * @param params - Pagination parameters
 * @returns Paginated list of the user's posts
 */
export async function getMyPosts(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Post>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { data: [], nextCursor: null, hasMore: false }
  }
  
  const { cursor, limit = 10 } = params
  const supabase = await createClient()
  
  let query = supabase
    .from('posts')
    .select('*')
    .eq('author_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit + 1)
  
  if (cursor) {
    const [cursorDate, cursorId] = cursor.split('_')
    query = query.or(`updated_at.lt.${cursorDate},and(updated_at.eq.${cursorDate},id.lt.${cursorId})`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching user posts:', error)
    return { data: [], nextCursor: null, hasMore: false }
  }
  
  const hasMore = data.length > limit
  const posts = hasMore ? data.slice(0, limit) : data
  
  let nextCursor: string | null = null
  if (hasMore && posts.length > 0) {
    const lastPost = posts[posts.length - 1]
    nextCursor = `${lastPost.updated_at}_${lastPost.id}`
  }
  
  return {
    data: posts as Post[],
    nextCursor,
    hasMore,
  }
}

/**
 * Publish a draft post
 * Convenience method that updates status to 'published'
 * 
 * @param postId - The ID of the post to publish
 */
export async function publishPost(postId: string): Promise<ActionResult<Post>> {
  return updatePost(postId, { status: 'published' })
}

/**
 * Unpublish a post (make it a draft)
 * 
 * @param postId - The ID of the post to unpublish
 */
export async function unpublishPost(postId: string): Promise<ActionResult<Post>> {
  return updatePost(postId, { status: 'draft' })
}

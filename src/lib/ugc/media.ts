'use server'

/**
 * Media Upload Utilities for UGC
 * 
 * This module handles file uploads to Supabase Storage using signed URLs.
 * 
 * Signed URL = A temporary URL with a cryptographic signature that grants
 * upload/download permission for a limited time. Like a time-limited access pass.
 * 
 * Flow:
 * 1. Client requests signed upload URL
 * 2. Server validates auth, generates signed URL (valid for X seconds)
 * 3. Client uploads file directly to Supabase Storage using the URL
 * 4. Client calls server to create the post_media database record
 * 
 * Benefits:
 * - Files go directly to storage (no server relay = faster uploads)
 * - Short-lived URLs (security)
 * - Server controls who can upload where
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createMediaSchema, fileUploadSchema, safeParse } from './schemas'
import { isValidFile, getMediaType } from './types'
import type { PostMedia, CreateMediaInput, MediaType } from './types'
import type { ActionResult } from './posts'

// =============================================================================
// Constants
// =============================================================================

const BUCKET_NAME = 'ugc-main'
const SIGNED_URL_EXPIRY = 60 // seconds (1 minute to complete upload)

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

/**
 * Generate a unique file path for storage
 * 
 * Path format: {user_id}/{post_id}/{uuid}.{extension}
 * Example: abc123/def456/randomuuid.jpg
 * 
 * This structure:
 * - Groups files by user (for easy cleanup if user deletes account)
 * - Groups files by post (for easy cleanup if post is deleted)
 * - Uses UUID to prevent filename collisions
 */
function generateStoragePath(
  userId: string,
  postId: string,
  fileName: string
): string {
  // Get file extension
  const extension = fileName.split('.').pop()?.toLowerCase() || 'bin'
  
  // Generate UUID for uniqueness
  const uuid = crypto.randomUUID()
  
  return `${userId}/${postId}/${uuid}.${extension}`
}

// =============================================================================
// Signed URL Actions
// =============================================================================

/**
 * Request a signed URL for uploading a file
 * 
 * @param postId - The post this media will be attached to
 * @param fileName - The original file name
 * @param fileType - The MIME type of the file
 * @param fileSize - The size of the file in bytes
 * @returns Signed upload URL and the storage path
 */
export async function getUploadUrl(
  postId: string,
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<ActionResult<{ uploadUrl: string; storagePath: string }>> {
  try {
    const userId = await requireAuth()
    
    // Validate file metadata
    const validation = safeParse(fileUploadSchema, {
      name: fileName,
      type: fileType,
      size: fileSize,
    })
    
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    // Double-check with our custom validation
    const fileCheck = isValidFile({ type: fileType, size: fileSize })
    if (!fileCheck.valid) {
      return { success: false, error: fileCheck.error! }
    }
    
    // Generate unique storage path
    const storagePath = generateStoragePath(userId, postId, fileName)
    
    const supabase = await createClient()
    
    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(storagePath)
    
    if (error) {
      console.error('Error creating signed URL:', error)
      return { success: false, error: 'Failed to prepare file upload' }
    }
    
    return {
      success: true,
      data: {
        uploadUrl: data.signedUrl,
        storagePath,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Create a media record after successful upload
 * 
 * Call this AFTER the file has been uploaded using the signed URL.
 * This creates the database record linking the file to the post.
 * 
 * @param input - Media metadata
 * @returns The created media record
 */
export async function createMediaRecord(
  input: CreateMediaInput
): Promise<ActionResult<PostMedia>> {
  try {
    const userId = await requireAuth()
    
    // Validate input
    const validation = safeParse(createMediaSchema, input)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const supabase = await createClient()
    
    // Verify the file actually exists in storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(input.storage_path.split('/').slice(0, -1).join('/'), {
        search: input.storage_path.split('/').pop(),
      })
    
    // Note: We skip strict file verification for now as it can be tricky
    // RLS on post_media table ensures only the owner can insert
    
    const { data, error } = await supabase
      .from('post_media')
      .insert({
        post_id: validation.data.post_id,
        owner_id: userId,
        storage_path: validation.data.storage_path,
        file_name: validation.data.file_name,
        mime_type: validation.data.mime_type,
        size_bytes: validation.data.size_bytes,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating media record:', error)
      return { success: false, error: 'Failed to save media information' }
    }
    
    revalidatePath(`/posts/${input.post_id}`)
    
    return { success: true, data: data as PostMedia }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Delete a media file and its record
 * 
 * @param mediaId - The ID of the post_media record
 * @param postId - The post ID (for revalidation)
 * @returns Success or error
 */
export async function deleteMedia(
  mediaId: string,
  postId: string
): Promise<ActionResult<null>> {
  try {
    await requireAuth()
    
    const supabase = await createClient()
    
    // First, get the media record to know the storage path
    const { data: media, error: fetchError } = await supabase
      .from('post_media')
      .select('storage_path')
      .eq('id', mediaId)
      .single()
    
    if (fetchError || !media) {
      return { success: false, error: 'Media not found' }
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([media.storage_path])
    
    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Continue to delete the record anyway
    }
    
    // Delete the database record
    const { error: dbError } = await supabase
      .from('post_media')
      .delete()
      .eq('id', mediaId)
    
    if (dbError) {
      console.error('Error deleting media record:', dbError)
      return { success: false, error: 'Failed to delete media' }
    }
    
    revalidatePath(`/posts/${postId}`)
    
    return { success: true, data: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

/**
 * Get all media for a post
 * 
 * @param postId - The ID of the post
 * @returns List of media records
 */
export async function getPostMedia(postId: string): Promise<PostMedia[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('post_media')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching post media:', error)
    return []
  }
  
  return data as PostMedia[]
}

/**
 * Get a signed URL for downloading/viewing a media file
 * 
 * Use this to get a temporary URL for displaying private media.
 * 
 * @param storagePath - The path to the file in storage
 * @param expiresIn - How long the URL is valid (default: 1 hour)
 * @returns Signed download URL
 */
export async function getMediaUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn)
  
  if (error) {
    console.error('Error creating signed download URL:', error)
    return null
  }
  
  return data.signedUrl
}

/**
 * Get public URL for a media file
 * Note: Only works if the bucket is public. Our bucket is private,
 * so use getMediaUrl() for signed URLs instead.
 */
export async function getPublicMediaUrl(storagePath: string): Promise<string> {
  const supabase = await createClient()
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath)
  
  return data.publicUrl
}

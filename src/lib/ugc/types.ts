/**
 * UGC (User-Generated Content) TypeScript Types
 * 
 * These types define the shape of data for the UGC platform:
 * - Profiles: User profile information
 * - Posts: Blog posts, discussions, and other user content
 * - Comments: Threaded comments on posts
 * - Media: Uploaded files (images, videos, audio, PDFs)
 */

// =============================================================================
// Profile Types
// =============================================================================

/**
 * User profile information, linked to Supabase Auth user
 */
export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

/**
 * Profile data for creating/updating (omits auto-generated fields)
 */
export type ProfileUpdate = Pick<Profile, 'username' | 'display_name' | 'avatar_url' | 'bio'>

// =============================================================================
// Post Types
// =============================================================================

/**
 * Post category options
 */
export type PostCategory = 'post' | 'blog' | 'discussion'

/**
 * Post status for draft/publish workflow
 */
export type PostStatus = 'draft' | 'published'

/**
 * A user-created post (blog, discussion, etc.)
 */
export interface Post {
  id: string
  author_id: string
  title: string
  content: string
  category: PostCategory
  status: PostStatus
  created_at: string
  updated_at: string
}

/**
 * Post with joined author profile data
 */
export interface PostWithAuthor extends Post {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

/**
 * Data required to create a new post
 */
export interface CreatePostInput {
  title: string
  content: string
  category?: PostCategory
  status?: PostStatus
}

/**
 * Data for updating an existing post
 */
export interface UpdatePostInput {
  title?: string
  content?: string
  category?: PostCategory
  status?: PostStatus
}

// =============================================================================
// Comment Types
// =============================================================================

/**
 * A comment on a post, supports threading via parent_comment_id
 */
export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
  updated_at: string
}

/**
 * Comment with joined author profile data
 */
export interface CommentWithAuthor extends Comment {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

/**
 * Comment with nested replies (for threaded display)
 */
export interface CommentThread extends CommentWithAuthor {
  replies: CommentThread[]
}

/**
 * Data required to create a new comment
 */
export interface CreateCommentInput {
  post_id: string
  content: string
  parent_comment_id?: string
}

/**
 * Data for updating an existing comment
 */
export interface UpdateCommentInput {
  content: string
}

// =============================================================================
// Media Types
// =============================================================================

/**
 * Allowed MIME types for media uploads
 * MIME = Multipurpose Internet Mail Extensions (file type identifier)
 */
export const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  documents: ['application/pdf'],
} as const

/**
 * All allowed MIME types as a flat array
 */
export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES.images,
  ...ALLOWED_MIME_TYPES.videos,
  ...ALLOWED_MIME_TYPES.audio,
  ...ALLOWED_MIME_TYPES.documents,
] as const

/**
 * Maximum file sizes in bytes
 * MB = Megabyte (1 MB = 1,048,576 bytes)
 */
export const MAX_FILE_SIZES = {
  images: 5 * 1024 * 1024,      // 5 MB
  videos: 50 * 1024 * 1024,     // 50 MB
  audio: 10 * 1024 * 1024,      // 10 MB
  documents: 10 * 1024 * 1024,  // 10 MB
} as const

/**
 * Media type category derived from MIME type
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document'

/**
 * Uploaded media file metadata
 */
export interface PostMedia {
  id: string
  post_id: string
  owner_id: string
  storage_path: string
  file_name: string
  mime_type: string
  size_bytes: number
  created_at: string
}

/**
 * Data required to create a media record (after upload)
 */
export interface CreateMediaInput {
  post_id: string
  storage_path: string
  file_name: string
  mime_type: string
  size_bytes: number
}

// =============================================================================
// Pagination Types
// =============================================================================

/**
 * Cursor-based pagination parameters
 * Cursor = A pointer to a specific position in a dataset
 */
export interface PaginationParams {
  cursor?: string      // Encoded cursor (created_at + id)
  limit?: number       // Number of items per page (default: 10)
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: string | null  // null = no more pages
  hasMore: boolean
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the media type category from a MIME type string
 */
export function getMediaType(mimeType: string): MediaType | null {
  if (ALLOWED_MIME_TYPES.images.includes(mimeType as typeof ALLOWED_MIME_TYPES.images[number])) {
    return 'image'
  }
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType as typeof ALLOWED_MIME_TYPES.videos[number])) {
    return 'video'
  }
  if (ALLOWED_MIME_TYPES.audio.includes(mimeType as typeof ALLOWED_MIME_TYPES.audio[number])) {
    return 'audio'
  }
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType as typeof ALLOWED_MIME_TYPES.documents[number])) {
    return 'document'
  }
  return null
}

/**
 * Get the maximum allowed file size for a given MIME type
 */
export function getMaxFileSize(mimeType: string): number {
  const mediaType = getMediaType(mimeType)
  if (!mediaType) return 0
  
  switch (mediaType) {
    case 'image': return MAX_FILE_SIZES.images
    case 'video': return MAX_FILE_SIZES.videos
    case 'audio': return MAX_FILE_SIZES.audio
    case 'document': return MAX_FILE_SIZES.documents
  }
}

/**
 * Check if a file is valid (type and size)
 */
export function isValidFile(file: { type: string; size: number }): { valid: boolean; error?: string } {
  const mediaType = getMediaType(file.type)
  
  if (!mediaType) {
    return { valid: false, error: `File type "${file.type}" is not allowed` }
  }
  
  const maxSize = getMaxFileSize(file.type)
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    return { valid: false, error: `File size exceeds ${maxSizeMB} MB limit` }
  }
  
  return { valid: true }
}

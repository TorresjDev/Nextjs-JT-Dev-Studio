/**
 * Zod Validation Schemas for UGC (User-Generated Content)
 * 
 * Zod = A TypeScript-first schema validation library
 * Schema = A blueprint that defines the shape and rules for data
 * 
 * These schemas validate user input BEFORE it reaches the database,
 * preventing invalid data and providing helpful error messages.
 */

import { z } from 'zod'
import { ALL_ALLOWED_MIME_TYPES, MAX_FILE_SIZES, getMediaType, getMaxFileSize } from './types'

// =============================================================================
// Profile Schemas
// =============================================================================

/**
 * Schema for updating a user profile
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  display_name: z
    .string()
    .max(100, 'Display name must be 100 characters or less')
    .optional(),
  avatar_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or less')
    .optional()
    .nullable(),
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>

// =============================================================================
// Post Schemas
// =============================================================================

/**
 * Valid post categories
 */
const postCategorySchema = z.enum(['post', 'blog', 'discussion'])

/**
 * Valid post statuses
 */
const postStatusSchema = z.enum(['draft', 'published'])

/**
 * Schema for creating a new post
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform((val) => val.trim()),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be 50,000 characters or less'),
  category: postCategorySchema.default('post'),
  status: postStatusSchema.default('draft'),
})

export type CreatePostSchema = z.infer<typeof createPostSchema>

/**
 * Schema for updating an existing post
 */
export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform((val) => val.trim())
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be 50,000 characters or less')
    .optional(),
  category: postCategorySchema.optional(),
  status: postStatusSchema.optional(),
})

export type UpdatePostSchema = z.infer<typeof updatePostSchema>

// =============================================================================
// Comment Schemas
// =============================================================================

/**
 * Schema for creating a new comment
 */
export const createCommentSchema = z.object({
  post_id: z
    .string()
    .uuid('Invalid post ID'),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment must be 5,000 characters or less'),
  parent_comment_id: z
    .string()
    .uuid('Invalid parent comment ID')
    .optional()
    .nullable(),
})

export type CreateCommentSchema = z.infer<typeof createCommentSchema>

/**
 * Schema for updating an existing comment
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment must be 5,000 characters or less'),
})

export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>

// =============================================================================
// Media Schemas
// =============================================================================

/**
 * Schema for validating file uploads (client-side check)
 * 
 * Note: This validates the file metadata before upload.
 * The actual file content should be validated server-side.
 */
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z
    .string()
    .refine(
      (type) => ALL_ALLOWED_MIME_TYPES.includes(type as typeof ALL_ALLOWED_MIME_TYPES[number]),
      { message: 'File type is not allowed' }
    ),
  size: z.number().positive('File size must be positive'),
}).refine(
  (file) => {
    const maxSize = getMaxFileSize(file.type)
    return file.size <= maxSize
  },
  { message: 'File size exceeds the limit for this file type' }
)

export type FileUploadSchema = z.infer<typeof fileUploadSchema>

/**
 * Schema for creating a media record after successful upload
 */
export const createMediaSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  storage_path: z.string().min(1, 'Storage path is required'),
  file_name: z.string().min(1, 'File name is required'),
  mime_type: z.string().refine(
    (type) => ALL_ALLOWED_MIME_TYPES.includes(type as typeof ALL_ALLOWED_MIME_TYPES[number]),
    'Invalid MIME type'
  ),
  size_bytes: z.number().positive('File size must be positive'),
})

export type CreateMediaSchema = z.infer<typeof createMediaSchema>

// =============================================================================
// Pagination Schemas
// =============================================================================

/**
 * Schema for pagination query parameters
 */
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),
})

export type PaginationSchema = z.infer<typeof paginationSchema>

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Safely parse and validate data with a Zod schema
 * Returns either the validated data or an error message
 * 
 * @example
 * const result = safeParse(createPostSchema, userInput)
 * if (!result.success) {
 *   console.error(result.error)
 *   return
 * }
 * // result.data is now typed and validated
 */
export function safeParse<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  // Get the first error message
  const firstError = result.error.issues[0]
  const path = firstError.path.join('.')
  const message = path ? `${path}: ${firstError.message}` : firstError.message
  
  return { success: false, error: message }
}

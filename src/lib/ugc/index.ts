/**
 * UGC (User-Generated Content) Library
 * 
 * Central export point for all UGC-related functionality.
 * Import from '@/lib/ugc' instead of individual files.
 * 
 * Example:
 * import { createPost, Comment, createPostSchema } from '@/lib/ugc'
 */

// Types
export type {
  Profile,
  ProfileUpdate,
  Post,
  PostWithAuthor,
  PostCategory,
  PostStatus,
  CreatePostInput,
  UpdatePostInput,
  Comment,
  CommentWithAuthor,
  CommentThread,
  CreateCommentInput,
  UpdateCommentInput,
  PostMedia,
  CreateMediaInput,
  MediaType,
  PaginationParams,
  PaginatedResponse,
} from './types'

export {
  ALLOWED_MIME_TYPES,
  ALL_ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  getMediaType,
  getMaxFileSize,
  isValidFile,
} from './types'

// Validation Schemas
export {
  updateProfileSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
  fileUploadSchema,
  createMediaSchema,
  paginationSchema,
  safeParse,
} from './schemas'

export type {
  UpdateProfileSchema,
  CreatePostSchema,
  UpdatePostSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  FileUploadSchema,
  CreateMediaSchema,
  PaginationSchema,
} from './schemas'

// Server Actions - Posts
export {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  getMyPosts,
  publishPost,
  unpublishPost,
} from './posts'

export type { ActionResult } from './posts'

// Server Actions - Comments
export {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  getThreadedComments,
  getCommentCount,
} from './comments'

// Server Actions - Media
export {
  getUploadUrl,
  createMediaRecord,
  deleteMedia,
  getPostMedia,
  getMediaUrl,
  getPublicMediaUrl,
} from './media'

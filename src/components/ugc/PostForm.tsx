'use client'

/**
 * Post Form Component
 * 
 * A reusable form for creating and editing posts.
 * Uses Tiptap rich text editor for content with formatting options.
 * Handles validation, media uploads, and submission.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, updatePost, createMediaRecord, type Post, type PostCategory } from '@/lib/ugc'
import { MediaUploader } from './MediaUploader'
import { RichTextEditor } from './RichTextEditor'

interface PostFormProps {
  mode: 'create' | 'edit'
  initialData?: Post
  postId?: string
}

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'post', label: 'Post' },
  { value: 'blog', label: 'Blog' },
  { value: 'discussion', label: 'Discussion' },
]

export function PostForm({ mode, initialData, postId }: PostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [category, setCategory] = useState<PostCategory>(initialData?.category || 'post')
  const [error, setError] = useState<string | null>(null)
  
  // Media uploads
  const [uploadedMedia, setUploadedMedia] = useState<{ storagePath: string; fileName: string; mimeType: string; size: number }[]>([])

  // Strip HTML tags for validation (content required check)
  const getPlainText = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    
    const plainContent = getPlainText(content)
    if (!plainContent.trim()) {
      setError('Content is required')
      return
    }

    startTransition(async () => {
      let result

      if (mode === 'create') {
        result = await createPost({
          title: title.trim(),
          content: content, // Store HTML content
          category,
          status,
        })

        if (result.success && uploadedMedia.length > 0) {
          // Create media records for uploaded files
          for (const media of uploadedMedia) {
            await createMediaRecord({
              post_id: result.data.id,
              storage_path: media.storagePath,
              file_name: media.fileName,
              mime_type: media.mimeType,
              size_bytes: media.size,
            })
          }
        }
      } else if (postId) {
        result = await updatePost(postId, {
          title: title.trim(),
          content: content, // Store HTML content
          category,
          status,
        })
      } else {
        setError('Post ID is required for editing')
        return
      }

      if (result?.success) {
        router.push(`/posts/${result.data.id}`)
        router.refresh()
      } else {
        setError(result?.error || 'Failed to save post')
      }
    })
  }

  const handleMediaUpload = (media: { storagePath: string; fileName: string; mimeType: string; size: number }) => {
    setUploadedMedia((prev) => [...prev, media])
  }

  const handleMediaRemove = (storagePath: string) => {
    setUploadedMedia((prev) => prev.filter((m) => m.storagePath !== storagePath))
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a compelling title..."
          disabled={isPending}
          className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors text-lg"
          maxLength={200}
        />
        <p className="mt-1 text-xs text-muted-foreground text-right">{title.length}/200</p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as PostCategory)}
          disabled={isPending}
          className="w-full sm:w-auto px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content - Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="What's on your mind? Write something amazing..."
          maxLength={50000}
          disabled={isPending}
        />
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Attachments
        </label>
        <MediaUploader
          postId={postId || 'temp'}
          onUpload={handleMediaUpload}
          onRemove={handleMediaRemove}
          uploadedMedia={uploadedMedia}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Actions - Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-4 py-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 transition-colors order-3 sm:order-1"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('draft')}
          disabled={isPending}
          className="px-4 py-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 transition-colors order-2"
        >
          {isPending ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('published')}
          disabled={isPending}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium order-1 sm:order-3"
        >
          {isPending ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </form>
  )
}

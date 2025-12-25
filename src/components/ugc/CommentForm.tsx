'use client'

/**
 * Comment Form Component
 * 
 * A form for creating new comments or replies.
 * Handles validation and submission.
 */

import { useState, useTransition } from 'react'
import { createComment } from '@/lib/ugc'

interface CommentFormProps {
  postId: string
  parentCommentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  submitLabel?: string
}

export function CommentForm({
  postId,
  parentCommentId,
  onSuccess,
  onCancel,
  placeholder = 'Write a comment...',
  submitLabel = 'Post Comment',
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    startTransition(async () => {
      const result = await createComment({
        post_id: postId,
        content: content.trim(),
        parent_comment_id: parentCommentId,
      })

      if (result.success) {
        setContent('')
        onSuccess?.()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        className="w-full min-h-[100px] p-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary resize-y disabled:opacity-50 disabled:cursor-not-allowed"
        maxLength={5000}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/5000
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="px-4 py-2 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Posting...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}

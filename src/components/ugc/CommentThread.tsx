'use client'

/**
 * Comment Thread Component
 * 
 * Displays a threaded comment with nested replies.
 * Supports editing, deleting, and replying to comments.
 */

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from './utils'
import { useAuth } from '@/context/AuthContext'
import { deleteComment } from '@/lib/ugc'
import type { CommentThread as CommentThreadType } from '@/lib/ugc'
import { CommentForm } from './CommentForm'

interface CommentThreadProps {
  comment: CommentThreadType
  postId: string
  depth?: number
  maxDepth?: number
}

/**
 * Single comment with nested replies
 * 
 * Depth = How many levels deep in the reply chain
 * MaxDepth = Limit nesting to prevent infinite indentation
 */
export function CommentThread({ 
  comment, 
  postId,
  depth = 0, 
  maxDepth = 3 
}: CommentThreadProps) {
  const { user } = useAuth()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)

  const isAuthor = user?.id === comment.author_id
  const canReply = depth < maxDepth && user

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    setIsDeleting(true)
    const result = await deleteComment(comment.id, postId)
    if (!result.success) {
      alert(result.error)
    }
    setIsDeleting(false)
  }

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-border/30' : ''}`}>
      <div className="py-4">
        {/* Comment Header: Author + Timestamp */}
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
            {comment.author.avatar_url ? (
              <Image
                src={comment.author.avatar_url}
                alt={comment.author.display_name || comment.author.username || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                {(comment.author.display_name || comment.author.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Author Name + Timestamp */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">
              {comment.author.display_name || comment.author.username || 'Anonymous'}
            </span>
            <span className="text-muted-foreground">·</span>
            <time 
              dateTime={comment.created_at}
              className="text-xs text-muted-foreground"
              title={new Date(comment.created_at).toLocaleString()}
            >
              {formatDistanceToNow(comment.created_at)}
            </time>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[80px] p-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary resize-y"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  // TODO: Implement edit functionality
                  setIsEditing(false)
                }}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(comment.content)
                }}
                className="px-3 py-1.5 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">
            {comment.content}
          </p>
        )}

        {/* Actions: Reply, Edit, Delete */}
        <div className="flex items-center gap-4 text-xs">
          {canReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Reply
            </button>
          )}
          {isAuthor && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4">
            <CommentForm
              postId={postId}
              parentCommentId={comment.id}
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
              placeholder="Write a reply..."
              submitLabel="Reply"
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Comments Section
 * 
 * Container for all comments on a post
 */
interface CommentsSectionProps {
  postId: string
  comments: CommentThreadType[]
}

export function CommentsSection({ postId, comments }: CommentsSectionProps) {
  const { user } = useAuth()

  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {/* New Comment Form */}
      {user ? (
        <div className="mb-8">
          <CommentForm postId={postId} />
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">Sign in</a> to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-0 divide-y divide-border/50">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              postId={postId}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </section>
  )
}

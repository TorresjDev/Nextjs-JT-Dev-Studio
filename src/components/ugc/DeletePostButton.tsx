'use client'

/**
 * Delete Post Button Component
 * 
 * A button that allows the post owner to delete their post.
 * Only renders if the current user is the author of the post.
 * Shows a confirmation dialog before deletion.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/lib/ugc'

interface DeletePostButtonProps {
    postId: string
    authorId: string
    currentUserId: string | null
}

export function DeletePostButton({ postId, authorId, currentUserId }: DeletePostButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Only show button if the current user is the author
    if (!currentUserId || currentUserId !== authorId) {
        return null
    }

    const handleDelete = () => {
        setError(null)
        startTransition(async () => {
            const result = await deletePost(postId)

            if (result.success) {
                // Use window.location for a full navigation to avoid the race condition
                // where router.refresh() tries to re-render the deleted post
                window.location.href = '/posts'
            } else {
                setError(result.error)
                setShowConfirm(false)
            }
        })
    }

    if (showConfirm) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive flex-1">
                    Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-3 py-1.5 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        )
    }

    return (
        <div className="mt-6 pt-6 border-t border-border">
            {error && (
                <p className="text-sm text-destructive mb-3">{error}</p>
            )}
            <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Post
            </button>
        </div>
    )
}

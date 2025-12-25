'use client'

/**
 * Post Card Component
 * 
 * Displays a single post in a card format for the feed.
 * Shows title, excerpt, author info, and metadata.
 */

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from './utils'
import type { PostWithAuthor } from '@/lib/ugc'

interface PostCardProps {
  post: PostWithAuthor
  showAuthor?: boolean
}

export function PostCard({ post, showAuthor = true }: PostCardProps) {
  // Create an excerpt from the content (first 150 characters)
  const excerpt = post.content.length > 150 
    ? post.content.substring(0, 150) + '...' 
    : post.content

  return (
    <article className="group relative bg-card rounded-xl border border-border/50 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
          {post.category}
        </span>
        {post.status === 'draft' && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
            Draft
          </span>
        )}
      </div>

      {/* Title */}
      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {excerpt}
      </p>

      {/* Footer: Author + Timestamp */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        {showAuthor && post.author && (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
              {post.author.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.display_name || post.author.username || 'Author'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                  {(post.author.display_name || post.author.username || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            {/* Name */}
            <div className="text-sm">
              <span className="font-medium text-foreground">
                {post.author.display_name || post.author.username || 'Anonymous'}
              </span>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <time 
          dateTime={post.created_at} 
          className="text-xs text-muted-foreground"
          title={new Date(post.created_at).toLocaleString()}
        >
          {formatDistanceToNow(post.created_at)}
        </time>
      </div>

      {/* Hover overlay link */}
      <Link 
        href={`/posts/${post.id}`} 
        className="absolute inset-0 rounded-xl"
        aria-label={`Read more: ${post.title}`}
      />
    </article>
  )
}

/**
 * Post Card Skeleton
 * 
 * Loading placeholder for PostCard while data is being fetched.
 * Skeleton = A placeholder UI that mimics the shape of content
 */
export function PostCardSkeleton() {
  return (
    <article className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
      {/* Category Badge Skeleton */}
      <div className="mb-3">
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>

      {/* Title Skeleton */}
      <div className="h-7 w-3/4 rounded bg-muted mb-2" />

      {/* Excerpt Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-3 w-20 rounded bg-muted" />
      </div>
    </article>
  )
}

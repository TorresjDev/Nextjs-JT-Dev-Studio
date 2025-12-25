/**
 * Post Detail Page
 * 
 * Displays a single post with its full content and comments.
 * Uses dynamic routing: /posts/[id] where [id] is the post UUID.
 * 
 * Dynamic Route = A route that changes based on a parameter
 * UUID = Universally Unique Identifier (the post's ID)
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPost, getThreadedComments, getPostMedia, getMediaUrl } from '@/lib/ugc'
import { CommentsSection, PostReactions, formatDistanceToNow, formatDate } from '@/components/ugc'

// Generate metadata dynamically based on the post
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  
  if (!post) {
    return { title: 'Post Not Found | JT Dev Studio' }
  }
  
  return {
    title: `${post.title} | JT Dev Studio`,
    description: post.content.substring(0, 160),
  }
}

/**
 * Post Content Component
 */
async function PostContent({ postId }: { postId: string }) {
  const [post, comments, media] = await Promise.all([
    getPost(postId),
    getThreadedComments(postId),
    getPostMedia(postId),
  ])

  if (!post) {
    notFound()
  }

  // Get signed URLs for media
  const mediaWithUrls = await Promise.all(
    media.map(async (m) => ({
      ...m,
      url: await getMediaUrl(m.storage_path),
    }))
  )

  return (
    <article className="bg-card rounded-xl border border-border/50 p-8">
      {/* Category + Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
          {post.category}
        </span>
        {post.status === 'draft' && (
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
            Draft
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

      {/* Author + Metadata */}
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
        {post.author && (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
              {post.author.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.display_name || post.author.username || 'Author'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-medium">
                  {(post.author.display_name || post.author.username || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            {/* Name + Date */}
            <div>
              <p className="font-medium">
                {post.author.display_name || post.author.username || 'Anonymous'}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(post.created_at)}
                {post.updated_at !== post.created_at && (
                  <span> · Updated {formatDistanceToNow(post.updated_at)}</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {mediaWithUrls.length > 0 && (
        <div className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-2">
          {mediaWithUrls.map((m) => {
            if (!m.url) return null
            
            const isImage = m.mime_type.startsWith('image/')
            const isVideo = m.mime_type.startsWith('video/')
            const isAudio = m.mime_type.startsWith('audio/')
            const isPdf = m.mime_type === 'application/pdf'
            
            if (isImage) {
              return (
                <div key={m.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={m.url}
                    alt={m.file_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )
            }
            
            if (isVideo) {
              return (
                <video 
                  key={m.id} 
                  src={m.url} 
                  controls 
                  className="w-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )
            }
            
            if (isAudio) {
              return (
                <audio 
                  key={m.id} 
                  src={m.url} 
                  controls 
                  className="w-full"
                >
                  Your browser does not support the audio tag.
                </audio>
              )
            }
            
            if (isPdf) {
              return (
                <a 
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm3 3c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                  </svg>
                  <div>
                    <p className="font-medium">{m.file_name}</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                </a>
              )
            }
            
            return null
          })}
        </div>
      )}

      {/* Content - Render HTML from rich text editor */}
      <div 
        className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-em:text-foreground/90 prose-li:text-foreground/90 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Reactions */}
      <PostReactions postId={postId} />

      {/* Comments Section */}
      <CommentsSection postId={postId} comments={comments} />
    </article>
  )
}

/**
 * Loading State
 */
function PostContentSkeleton() {
  return (
    <article className="bg-card rounded-xl border border-border/50 p-8 animate-pulse">
      <div className="h-6 w-20 rounded-full bg-muted mb-4" />
      <div className="h-10 w-3/4 rounded bg-muted mb-4" />
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div>
          <div className="h-5 w-32 rounded bg-muted mb-2" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </article>
  )
}

/**
 * Main Page Component
 */
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link 
        href="/posts"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Posts
      </Link>

      <Suspense fallback={<PostContentSkeleton />}>
        <PostContent postId={id} />
      </Suspense>
    </main>
  )
}

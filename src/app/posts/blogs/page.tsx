/**
 * Blogs Page
 * 
 * Displays a paginated list of published blog posts.
 * Filters posts by the 'blog' category for long-form tutorial content.
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { getPosts } from '@/lib/ugc'
import { PostCard, PostCardSkeleton } from '@/components/ugc'

// Metadata for SEO
export const metadata = {
    title: 'Blogs | JT Dev Studio',
    description: 'In-depth guides, tutorials, and development insights from the community.',
}

/**
 * Blogs Feed with Server-Side Data Fetching
 */
async function BlogsFeed() {
    const { data: posts, hasMore } = await getPosts({ limit: 10, category: 'blog' })

    if (posts.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">No blog posts yet</h2>
                <p className="text-muted-foreground mb-6">Be the first to share a tutorial or guide!</p>
                <Link
                    href="/editor/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Blog Post
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {hasMore && (
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        More blog posts available. Scroll down or refresh to see more.
                    </p>
                </div>
            )}
        </>
    )
}

/**
 * Loading State
 */
function BlogsFeedSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    )
}

/**
 * Main Page Component
 */
export default function BlogsPage() {
    return (
        <main className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Blog & Tutorials</h1>
                    <p className="text-muted-foreground">
                        In-depth guides, tutorials, and development insights.
                    </p>
                </div>
                <Link
                    href="/editor/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Blog
                </Link>
            </div>

            {/* Blogs Feed */}
            <Suspense fallback={<BlogsFeedSkeleton />}>
                <BlogsFeed />
            </Suspense>
        </main>
    )
}

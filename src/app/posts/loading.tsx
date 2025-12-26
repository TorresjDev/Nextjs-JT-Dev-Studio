/**
 * Posts Loading State
 * 
 * Displays while the posts page is loading.
 */

export default function PostsLoading() {
    return (
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-10 w-48 bg-muted rounded-lg animate-pulse mb-4" />
                <div className="h-5 w-96 bg-muted/60 rounded animate-pulse" />
            </div>

            {/* Post Cards Skeleton */}
            <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <article
                        key={i}
                        className="bg-card rounded-xl border border-border/50 p-6 animate-pulse"
                    >
                        {/* Category Badge */}
                        <div className="h-6 w-20 rounded-full bg-muted mb-4" />

                        {/* Title */}
                        <div className="h-7 w-3/4 rounded bg-muted mb-3" />

                        {/* Content Preview */}
                        <div className="space-y-2 mb-4">
                            <div className="h-4 w-full rounded bg-muted/60" />
                            <div className="h-4 w-5/6 rounded bg-muted/60" />
                        </div>

                        {/* Author + Meta */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted" />
                            <div>
                                <div className="h-4 w-24 rounded bg-muted mb-1" />
                                <div className="h-3 w-16 rounded bg-muted/60" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    )
}

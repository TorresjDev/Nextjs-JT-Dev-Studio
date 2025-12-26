/**
 * Guides Loading State
 * 
 * Displays while the guides page is loading.
 */

export default function GuidesLoading() {
    return (
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-10 w-40 bg-muted rounded-lg animate-pulse mb-4" />
                <div className="h-5 w-80 bg-muted/60 rounded animate-pulse" />
            </div>

            {/* Guide Categories Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-card rounded-xl border border-border/50 p-6 animate-pulse"
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-lg bg-muted mb-4" />

                        {/* Title */}
                        <div className="h-6 w-3/4 rounded bg-muted mb-2" />

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-4 w-full rounded bg-muted/60" />
                            <div className="h-4 w-4/5 rounded bg-muted/60" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}

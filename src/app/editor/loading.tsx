/**
 * Editor Loading State
 * 
 * Displays while the post editor is loading.
 */

export default function EditorLoading() {
    return (
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-64 bg-muted/60 rounded animate-pulse" />
            </div>

            {/* Editor Form Skeleton */}
            <div className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
                {/* Title Input */}
                <div className="mb-6">
                    <div className="h-4 w-16 bg-muted/60 rounded mb-2" />
                    <div className="h-12 w-full bg-muted rounded-lg" />
                </div>

                {/* Category Select */}
                <div className="mb-6">
                    <div className="h-4 w-20 bg-muted/60 rounded mb-2" />
                    <div className="h-10 w-48 bg-muted rounded-lg" />
                </div>

                {/* Editor Toolbar */}
                <div className="mb-4">
                    <div className="h-10 w-full bg-muted rounded-lg" />
                </div>

                {/* Editor Content Area */}
                <div className="h-64 w-full bg-muted/40 rounded-lg mb-6" />

                {/* Media Upload Area */}
                <div className="h-24 w-full bg-muted/30 rounded-lg border-2 border-dashed border-muted mb-6" />

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <div className="h-10 w-24 bg-muted rounded-lg" />
                    <div className="h-10 w-32 bg-primary/30 rounded-lg" />
                </div>
            </div>
        </main>
    )
}

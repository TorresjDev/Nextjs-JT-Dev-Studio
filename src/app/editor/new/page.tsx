/**
 * New Post Editor Page
 * 
 * Page for creating a new post.
 * Requires authentication (handled by middleware).
 * 
 * Layout: Full-width responsive design for comfortable writing experience.
 */

import { PostForm } from '@/components/ugc'

export const metadata = {
  title: 'Create New Post | JT Dev Studio',
  description: 'Create and share a new post with the community.',
}

export default function NewPostPage() {
  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Create New Post</h1>
        <p className="text-muted-foreground text-lg">
          Share your thoughts, ideas, or content with the community.
        </p>
      </div>

      {/* Post Form - Card with responsive padding */}
      <div className="bg-card rounded-xl border border-border/50 p-4 sm:p-6 lg:p-8">
        <PostForm mode="create" />
      </div>

      {/* Tips - Collapsed on mobile */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
        <details className="group">
          <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
            <span>✨ Tips for a great post</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <ul className="text-sm text-muted-foreground space-y-1 mt-3 pl-4">
            <li>• Use a clear, descriptive title that summarizes your content</li>
            <li>• Format your text with <strong>bold</strong>, <em>italic</em>, and lists for readability</li>
            <li>• Add images or media to make your post more engaging</li>
            <li>• Choose the right category to help others find your post</li>
            <li>• Save as draft if you need to come back later</li>
            <li>• Use Win+. (Windows) or Ctrl+Cmd+Space (Mac) for emojis 🎉</li>
          </ul>
        </details>
      </div>
    </main>
  )
}

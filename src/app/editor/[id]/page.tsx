/**
 * Edit Post Editor Page
 * 
 * Page for editing an existing post.
 * Uses dynamic routing: /editor/[id] where [id] is the post UUID.
 * Requires authentication and post ownership (handled by RLS).
 * 
 * Layout: Full-width responsive design matching the create page.
 */

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getPost } from '@/lib/ugc'
import { PostForm } from '@/components/ugc'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  
  if (!post) {
    return { title: 'Post Not Found | JT Dev Studio' }
  }
  
  return {
    title: `Edit: ${post.title} | JT Dev Studio`,
    description: 'Edit your post.',
  }
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get the post
  const post = await getPost(id)
  
  if (!post) {
    notFound()
  }
  
  // Check ownership
  if (post.author_id !== user.id) {
    redirect('/posts')
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Edit Post</h1>
        <p className="text-muted-foreground text-lg">
          Make changes to your post.
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm">Status:</span>
        {post.status === 'draft' ? (
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
            Draft
          </span>
        ) : (
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-500/10 text-green-500">
            Published
          </span>
        )}
      </div>

      {/* Post Form - Card with responsive padding */}
      <div className="bg-card rounded-xl border border-border/50 p-4 sm:p-6 lg:p-8">
        <PostForm 
          mode="edit" 
          initialData={post} 
          postId={id}
        />
      </div>
    </main>
  )
}

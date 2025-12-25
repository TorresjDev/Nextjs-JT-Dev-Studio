-- =============================================================================
-- UGC (User-Generated Content) Database Schema
-- =============================================================================
-- 
-- This migration creates the tables, indexes, triggers, and RLS (Row-Level 
-- Security) policies for the UGC platform.
--
-- ACRONYMS:
-- - RLS = Row-Level Security (database access control per row)
-- - UUID = Universally Unique Identifier (unique ID like "123e4567-e89b...")
-- - TIMESTAMPTZ = Timestamp with Time Zone (date/time with timezone info)
-- - FK = Foreign Key (reference to another table's primary key)
-- - PK = Primary Key (unique identifier for a row)
--
-- HOW TO APPLY:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
--
-- =============================================================================

-- =============================================================================
-- TABLE: profiles
-- =============================================================================
-- Stores user profile information. Each row is linked to a Supabase Auth user.
-- The trigger below automatically creates a profile when a user signs up.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for username lookups (e.g., finding user by @username)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Trigger function: Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    -- Extract username from GitHub/OAuth metadata, or use email prefix
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    -- Extract display name from OAuth metadata
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    -- Extract avatar URL from OAuth metadata
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (only if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TABLE: posts
-- =============================================================================
-- Stores user-created content (blog posts, discussions, etc.)

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 50000),
  category TEXT DEFAULT 'post' CHECK (category IN ('post', 'blog', 'discussion')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
-- Composite index for feed queries: "published posts, newest first"
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, created_at DESC);

-- =============================================================================
-- TABLE: comments
-- =============================================================================
-- Stores comments on posts. Supports threading via parent_comment_id.

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
-- Composite index for fetching comments on a post in order
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at ASC);

-- =============================================================================
-- TABLE: post_media
-- =============================================================================
-- Stores metadata for uploaded files attached to posts.
-- The actual files are stored in Supabase Storage bucket "ugc-media".

CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_media_post ON post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_post_media_owner ON post_media(owner_id);

-- =============================================================================
-- RLS (Row-Level Security) POLICIES
-- =============================================================================
-- RLS controls WHO can access WHICH rows in a table.
-- These policies ensure users can only access data they're allowed to see.

-- -----------------------------------------------------------------------------
-- profiles RLS
-- -----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles (needed to show author info on posts)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- posts RLS
-- -----------------------------------------------------------------------------
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT USING (status = 'published');

-- Authors can read their own drafts
CREATE POLICY "Authors can view own drafts"
  ON posts FOR SELECT USING (auth.uid() = author_id);

-- Authenticated users can create posts (must be the author)
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE USING (auth.uid() = author_id);

-- -----------------------------------------------------------------------------
-- comments RLS
-- -----------------------------------------------------------------------------
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments on published posts
CREATE POLICY "Comments on published posts are viewable"
  ON comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.status = 'published'
    )
  );

-- Authors can also see comments on their own draft posts
CREATE POLICY "Authors can see comments on own posts"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.author_id = auth.uid()
    )
  );

-- Authenticated users can comment on published posts
CREATE POLICY "Authenticated users can comment on published posts"
  ON comments FOR INSERT 
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_id 
      AND posts.status = 'published'
    )
  );

-- Authors can update their own comments
CREATE POLICY "Authors can update own comments"
  ON comments FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "Authors can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = author_id);

-- -----------------------------------------------------------------------------
-- post_media RLS
-- -----------------------------------------------------------------------------
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

-- Media for published posts is viewable by anyone
CREATE POLICY "Media for published posts is viewable"
  ON post_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_media.post_id 
      AND posts.status = 'published'
    )
  );

-- Owners can see their own media (even on drafts)
CREATE POLICY "Owners can view own media"
  ON post_media FOR SELECT USING (auth.uid() = owner_id);

-- Authenticated users can insert their own media
CREATE POLICY "Users can upload own media"
  ON post_media FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own media
CREATE POLICY "Users can delete own media"
  ON post_media FOR DELETE USING (auth.uid() = owner_id);

-- =============================================================================
-- STORAGE POLICIES (Run these in a separate query if needed)
-- =============================================================================
-- These policies control access to the "ugc-media" storage bucket.
-- NOTE: You must first create the bucket in the Supabase Dashboard:
--   Storage → New bucket → Name: "ugc-media" → Private: checked

-- Authenticated users can read files in the bucket
-- (We use signed URLs for actual access control)
CREATE POLICY "Authenticated users can read ugc media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'ugc-media');

-- Users can upload to their own folder (folder name = user ID)
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ugc-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ugc-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ugc-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- DONE! ✅
-- =============================================================================
-- After running this migration, verify in Supabase Dashboard:
-- 1. Table Editor → You should see: profiles, posts, comments, post_media
-- 2. Authentication → Users → Sign up/in → Check that a profile was created
-- 3. Database → Policies → Each table should have RLS policies listed

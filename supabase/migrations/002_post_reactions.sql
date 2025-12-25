-- =============================================================================
-- Post Reactions Schema
-- =============================================================================
-- Adds emoji reactions to posts (👍 ❤️ 🔥)
-- Run this in Supabase SQL Editor after the initial migration
-- =============================================================================

-- Create post_reactions table
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each user can only react once per reaction type per post
    UNIQUE(post_id, user_id, reaction_type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);

-- Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view reactions
CREATE POLICY "Anyone can view reactions"
    ON public.post_reactions FOR SELECT
    USING (true);

-- Authenticated users can add reactions
CREATE POLICY "Users can add reactions"
    ON public.post_reactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
    ON public.post_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- Helper function to get reaction counts for a post
-- =============================================================================
CREATE OR REPLACE FUNCTION get_post_reaction_counts(p_post_id UUID)
RETURNS TABLE (
    reaction_type TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.reaction_type,
        COUNT(*)::BIGINT
    FROM public.post_reactions pr
    WHERE pr.post_id = p_post_id
    GROUP BY pr.reaction_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

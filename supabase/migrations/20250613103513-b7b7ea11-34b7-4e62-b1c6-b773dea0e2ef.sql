
-- Drop all existing triggers first
DROP TRIGGER IF EXISTS trigger_update_likes_count_insert ON public.reactions;
DROP TRIGGER IF EXISTS trigger_update_likes_count_delete ON public.reactions;
DROP TRIGGER IF EXISTS update_likes_count_trigger ON public.reactions;
DROP TRIGGER IF EXISTS on_reaction_change ON public.reactions;
DROP TRIGGER IF EXISTS on_comment_change ON public.comments;

-- Now drop the functions
DROP FUNCTION IF EXISTS public.update_post_likes_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_comments_count() CASCADE;

-- Add views_count to post_stats table
ALTER TABLE public.post_stats ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;

-- Create a new table to track post views
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id) -- Prevent duplicate views from same user
);

-- Enable RLS on post_views table
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_views table
CREATE POLICY "Users can view all post views" 
  ON public.post_views 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create post views" 
  ON public.post_views 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create comprehensive function to update all post stats
CREATE OR REPLACE FUNCTION public.update_post_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_post_id UUID;
  new_likes_count INTEGER;
  new_comments_count INTEGER;
  new_views_count INTEGER;
BEGIN
  -- Determine the post_id based on the operation and table
  IF TG_TABLE_NAME = 'reactions' THEN
    target_post_id := COALESCE(NEW.post_id, OLD.post_id);
  ELSIF TG_TABLE_NAME = 'comments' THEN
    target_post_id := COALESCE(NEW.post_id, OLD.post_id);
  ELSIF TG_TABLE_NAME = 'post_views' THEN
    target_post_id := COALESCE(NEW.post_id, OLD.post_id);
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate current counts
  SELECT COUNT(*) INTO new_likes_count
  FROM public.reactions 
  WHERE post_id = target_post_id AND reaction_type = 'like';

  SELECT COUNT(*) INTO new_comments_count
  FROM public.comments 
  WHERE post_id = target_post_id;

  SELECT COUNT(*) INTO new_views_count
  FROM public.post_views 
  WHERE post_id = target_post_id;

  -- Update or insert post_stats
  INSERT INTO public.post_stats (post_id, likes_count, comments_count, views_count)
  VALUES (target_post_id, new_likes_count, new_comments_count, new_views_count)
  ON CONFLICT (post_id) 
  DO UPDATE SET 
    likes_count = new_likes_count,
    comments_count = new_comments_count,
    views_count = new_views_count,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for all relevant tables
CREATE TRIGGER on_reaction_stats_change
  AFTER INSERT OR DELETE ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_stats();

CREATE TRIGGER on_comment_stats_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_stats();

CREATE TRIGGER on_view_stats_change
  AFTER INSERT OR DELETE ON public.post_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_stats();

-- Function to safely record a post view
CREATE OR REPLACE FUNCTION public.record_post_view(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert view record, ignore if already exists
  INSERT INTO public.post_views (post_id, user_id, ip_address, user_agent)
  VALUES (p_post_id, p_user_id, p_ip_address, p_user_agent)
  ON CONFLICT (post_id, user_id) DO NOTHING;
  
  RETURN FOUND;
END;
$$;

-- Update existing post_stats with current counts
UPDATE public.post_stats 
SET 
  likes_count = (
    SELECT COUNT(*) 
    FROM public.reactions 
    WHERE post_id = post_stats.post_id AND reaction_type = 'like'
  ),
  comments_count = (
    SELECT COUNT(*) 
    FROM public.comments 
    WHERE post_id = post_stats.post_id
  ),
  views_count = COALESCE(views_count, 0),
  updated_at = now();

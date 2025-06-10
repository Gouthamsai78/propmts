
-- Create a new table to track post statistics
CREATE TABLE public.post_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id)
);

-- Enable RLS on post_stats table
ALTER TABLE public.post_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_stats table
CREATE POLICY "Users can view all post stats" 
  ON public.post_stats 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "System can manage post stats" 
  ON public.post_stats 
  FOR ALL 
  TO authenticated
  USING (true);

-- Create function to initialize post stats when a post is created
CREATE OR REPLACE FUNCTION public.initialize_post_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.post_stats (post_id, likes_count, comments_count)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$;

-- Create trigger to initialize post stats
CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_post_stats();

-- Update the likes count function to use post_stats table
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment likes count in post_stats
    INSERT INTO public.post_stats (post_id, likes_count, comments_count)
    VALUES (NEW.post_id, 1, 0)
    ON CONFLICT (post_id) 
    DO UPDATE SET 
      likes_count = post_stats.likes_count + 1,
      updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement likes count in post_stats
    UPDATE public.post_stats 
    SET 
      likes_count = GREATEST(0, likes_count - 1),
      updated_at = now()
    WHERE post_id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Update the comments count function to use post_stats table
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment comments count in post_stats
    INSERT INTO public.post_stats (post_id, likes_count, comments_count)
    VALUES (NEW.post_id, 0, 1)
    ON CONFLICT (post_id) 
    DO UPDATE SET 
      comments_count = post_stats.comments_count + 1,
      updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement comments count in post_stats
    UPDATE public.post_stats 
    SET 
      comments_count = GREATEST(0, comments_count - 1),
      updated_at = now()
    WHERE post_id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for reactions and comments
CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_comments_count();

-- Initialize post_stats for existing posts
INSERT INTO public.post_stats (post_id, likes_count, comments_count)
SELECT 
  p.id,
  COALESCE(p.likes_count, 0),
  COALESCE(p.comments_count, 0)
FROM public.posts p
ON CONFLICT (post_id) DO NOTHING;

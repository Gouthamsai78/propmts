
-- Enable RLS on reactions table
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on comments table  
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reactions table
CREATE POLICY "Users can view all reactions" 
  ON public.reactions 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own reactions" 
  ON public.reactions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
  ON public.reactions 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for comments table
CREATE POLICY "Users can view all comments" 
  ON public.comments 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own comments" 
  ON public.comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on posts table and create policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all posts" 
  ON public.posts 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts" 
  ON public.posts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

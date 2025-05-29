
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            username,
            avatar_url,
            display_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      return data || [];
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      prompt?: string | null;
      category?: string | null;
      allow_copy?: boolean;
      image_url?: string | null;
    }) => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: postData.title,
          content: postData.content,
          prompt: postData.prompt,
          category: postData.category,
          allow_copy: postData.allow_copy ?? true,
          image_url: postData.image_url,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User must be logged in');
      
      // Check if user already liked the post
      const { data: existingLike } = await supabase
        .from('reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', 'like')
        .single();

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like the post
        const { data, error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: 'like'
          });
        
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User must be logged in');
      
      // Check if post is already saved
      const { data: existingSave } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingSave) {
        // Unsave the post
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('id', existingSave.id);
        
        if (error) throw error;
        return { action: 'unsaved' };
      } else {
        // Save the post
        const { data, error } = await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
        return { action: 'saved' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePosts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      // First, fetch all posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      if (!posts || posts.length === 0) {
        return [];
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(posts.map(post => post.user_id))];
      
      // Fetch user data for all unique user IDs
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, avatar_url, display_name')
        .in('id', userIds);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Create a map of users by ID for quick lookup
      const usersMap = new Map(users?.map(user => [user.id, user]) || []);

      // If user is logged in, fetch their reactions and saved posts
      let userReactions: any[] = [];
      let userSavedPosts: any[] = [];
      
      if (user) {
        const postIds = posts.map(post => post.id);
        
        // Fetch user's reactions
        const { data: reactions } = await supabase
          .from('reactions')
          .select('post_id, reaction_type')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        userReactions = reactions || [];
        
        // Fetch user's saved posts
        const { data: savedPosts } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
          
        userSavedPosts = savedPosts || [];
      }

      // Create maps for quick lookup
      const likesMap = new Map(userReactions.filter(r => r.reaction_type === 'like').map(r => [r.post_id, true]));
      const savedMap = new Map(userSavedPosts.map(s => [s.post_id, true]));

      // Combine posts with user data and interaction states
      const postsWithUsers = posts.map(post => ({
        ...post,
        users: usersMap.get(post.user_id) || null,
        isLikedByUser: likesMap.has(post.id),
        isSavedByUser: savedMap.has(post.id)
      }));

      return postsWithUsers;
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

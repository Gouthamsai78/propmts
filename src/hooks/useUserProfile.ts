
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  return useQuery({
    queryKey: ['userProfile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('User ID required');
      
      console.log('Fetching user profile for:', targetUserId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      console.log('User profile fetched:', data);
      return data;
    },
    enabled: !!targetUserId,
  });
};

export const usePublicUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['publicUserProfile', userId],
    queryFn: async () => {
      console.log('Fetching public user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching public user profile:', error);
        throw error;
      }
      
      console.log('Public user profile fetched:', data);
      return data;
    },
    enabled: !!userId,
  });
};

export const useUserPosts = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  return useQuery({
    queryKey: ['userPosts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('User ID required');
      
      console.log('Fetching posts for user:', targetUserId);
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url,
            display_name
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user posts:', error);
        throw error;
      }
      
      console.log('User posts fetched:', posts?.length || 0);
      
      // Add interaction states if current user is viewing
      if (user && posts) {
        const postIds = posts.map(post => post.id);
        
        // Fetch user's reactions and saved posts
        const [reactionsResult, savedResult] = await Promise.all([
          supabase
            .from('reactions')
            .select('post_id, reaction_type')
            .eq('user_id', user.id)
            .in('post_id', postIds),
          supabase
            .from('saved_posts')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds)
        ]);
        
        const reactions = reactionsResult.data || [];
        const savedPosts = savedResult.data || [];
        
        const likesMap = new Map(reactions.filter(r => r.reaction_type === 'like').map(r => [r.post_id, true]));
        const savedMap = new Map(savedPosts.map(s => [s.post_id, true]));
        
        return posts.map(post => ({
          ...post,
          isLikedByUser: likesMap.has(post.id),
          isSavedByUser: savedMap.has(post.id)
        }));
      }
      
      return posts || [];
    },
    enabled: !!targetUserId,
  });
};

export const useSavedPosts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['savedPosts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching saved posts for user:', user.id);
      
      // Get saved post IDs
      const { data: savedPostIds, error: savedError } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id);
      
      if (savedError) {
        console.error('Error fetching saved post IDs:', savedError);
        throw savedError;
      }
      
      if (!savedPostIds || savedPostIds.length === 0) {
        console.log('No saved posts found');
        return [];
      }
      
      console.log('Found saved post IDs:', savedPostIds.length);
      
      // Get the actual posts
      const postIds = savedPostIds.map(sp => sp.post_id);
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url,
            display_name
          )
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching saved posts:', postsError);
        throw postsError;
      }
      
      console.log('Saved posts fetched:', posts?.length || 0);
      
      // Add interaction states
      if (posts) {
        const [reactionsResult] = await Promise.all([
          supabase
            .from('reactions')
            .select('post_id, reaction_type')
            .eq('user_id', user.id)
            .in('post_id', postIds)
        ]);
        
        const reactions = reactionsResult.data || [];
        const likesMap = new Map(reactions.filter(r => r.reaction_type === 'like').map(r => [r.post_id, true]));
        
        return posts.map(post => ({
          ...post,
          isLikedByUser: likesMap.has(post.id),
          isSavedByUser: true // All these posts are saved by definition
        }));
      }
      
      return [];
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profileData: {
      username?: string;
      display_name?: string;
      bio?: string;
      avatar_url?: string;
    }) => {
      if (!user) throw new Error('User must be logged in');
      
      console.log('Updating profile:', profileData);
      
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      console.log('Profile updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

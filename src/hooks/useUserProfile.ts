
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const usePublicUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['publicUserProfile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
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
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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
      
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          *,
          posts (
            *,
            users (
              username,
              avatar_url,
              display_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data?.map(saved => saved.posts) || [];
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
      
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

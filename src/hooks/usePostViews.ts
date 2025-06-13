
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRecordPostView = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      console.log('Recording view for post:', postId, 'User:', user?.id);
      
      try {
        // Record the view using the database function
        const { data, error } = await supabase.rpc('record_post_view', {
          p_post_id: postId,
          p_user_id: user?.id || null
        });
        
        if (error) {
          console.error('Error recording post view:', error);
          throw error;
        }
        
        console.log('View recorded successfully:', data);
        return data;
      } catch (error) {
        console.error('Failed to record view:', error);
        // Don't throw the error to prevent UI disruption
        return null;
      }
    },
    onSuccess: (_, postId) => {
      console.log('View recorded, updating post stats for:', postId);
      
      // Optimistic update for views count
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((post: any) => {
          if (post.id === postId) {
            return {
              ...post,
              views_count: (post.views_count || 0) + 1
            };
          }
          return post;
        });
      });

      // Invalidate queries to refresh view counts from server
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['userPosts'] });
        queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
        queryClient.invalidateQueries({ queryKey: ['searchPosts'] });
      }, 1000);
    },
    onError: (error) => {
      console.error('Error in view recording mutation:', error);
      // Silently handle the error to avoid disrupting the user experience
    },
  });
};


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRecordPostView = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      // Record the view using the database function
      const { data, error } = await supabase.rpc('record_post_view', {
        p_post_id: postId,
        p_user_id: user?.id || null
      });
      
      if (error) {
        console.error('Error recording post view:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate posts queries to refresh view counts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      // First fetch comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }
      
      if (!comments || comments.length === 0) {
        return [];
      }

      // Get unique user IDs from comments
      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      
      // Fetch user data for all comment authors
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, avatar_url, display_name')
        .in('id', userIds);
      
      if (usersError) {
        console.error('Error fetching users for comments:', usersError);
        // Continue without user data rather than failing completely
      }

      // Create a map for quick user lookup
      const usersMap = new Map((users || []).map(user => [user.id, user]));

      // Combine comments with user data
      const commentsWithUserData = comments.map(comment => {
        const userData = usersMap.get(comment.user_id);
        return {
          ...comment,
          users: userData || {
            id: comment.user_id,
            username: 'Anonymous',
            avatar_url: null,
            display_name: 'Anonymous'
          }
        };
      });

      return commentsWithUserData;
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error('User must be logged in');
      
      console.log('Creating comment for post:', postId);
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating comment:', error);
        throw error;
      }
      
      console.log('Comment created successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      console.log('Comment created, updating counts for post:', variables.postId);
      
      // Optimistic update for comments count
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((post: any) => {
          if (post.id === variables.postId) {
            return {
              ...post,
              comments_count: (post.comments_count || 0) + 1
            };
          }
          return post;
        });
      });

      // Invalidate comments query immediately
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      
      // Invalidate posts queries after a short delay to get updated counts
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      }, 500);
    },
  });
};

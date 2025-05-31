
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for comments table
  useEffect(() => {
    const commentsChannel = supabase
      .channel('comments-channel-' + postId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      }, (payload) => {
        console.log('Real-time comment update received:', payload);
        // Invalidate and refetch comments query to update UI
        queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        // Also invalidate posts to update comment counts
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, [postId, queryClient]);
  
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      console.log('Fetching comments for post:', postId);
      
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
      
      console.log('Comments fetched:', comments?.length || 0);
      
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

      console.log('Comments with user data:', commentsWithUserData.length);
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
      
      // Get current comments count - use maybeSingle instead of single to avoid 406 errors
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching post:', fetchError);
        throw fetchError;
      }
      
      // Default to 0 if post doesn't exist or has no comments_count
      const currentComments = (postData?.comments_count || 0);
      
      // Insert the comment
      const { data, error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content,
        })
        .select()
        .single();
      
      if (commentError) {
        console.error('Error creating comment:', commentError);
        throw commentError;
      }
      
      // Increment comments_count in posts table using raw SQL for atomic update
      const { error: updateError } = await supabase
        .from('posts')
        .update({ comments_count: supabase.raw('comments_count + 1') })
        .eq('id', postId);
      
      if (updateError) {
        console.error('Error updating post comments count:', updateError);
        // Try again with a different approach if the first one fails
        try {
          await supabase
            .from('posts')
            .update({ comments_count: currentComments + 1 })
            .eq('id', postId);
        } catch (fallbackError) {
          console.error('Fallback update also failed:', fallbackError);
          // Continue even if update fails to maintain user experience
        }
      }
      
      console.log('Comment created:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      
      // Force a refetch to ensure the latest data
      queryClient.refetchQueries({ queryKey: ['posts'] });
    },
  });
};

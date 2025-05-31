import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const usePosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for posts table
  useEffect(() => {
    const postsChannel = supabase
      .channel('posts-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
      }, (payload) => {
        console.log('Real-time update received:', payload);
        // Invalidate and refetch posts query to update UI
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      })
      .subscribe();

    // Set up real-time subscription for reactions table
    const reactionsChannel = supabase
      .channel('reactions-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
      }, (payload) => {
        console.log('Real-time reaction update received:', payload);
        // Invalidate and refetch posts query to update UI
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      })
      .subscribe();

    // Set up real-time subscription for saved_posts table
    const savedPostsChannel = supabase
      .channel('saved-posts-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'saved_posts',
      }, (payload) => {
        console.log('Real-time saved post update received:', payload);
        // Invalidate and refetch posts and savedPosts queries to update UI
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
      })
      .subscribe();

    // Update the cleanup function to remove the saved_posts channel
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(savedPostsChannel);
    };
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      console.log('Fetching posts...');
      
      // First fetch all posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      if (!posts || posts.length === 0) {
        console.log('No posts found');
        return [];
      }

      console.log('Posts fetched:', posts.length);

      // Get unique user IDs from posts
      const userIds = [...new Set(posts.map(post => post.user_id))];
      
      // Fetch user data for all authors
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, avatar_url, display_name')
        .in('id', userIds);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        // Continue without user data rather than failing completely
      }

      // Create a map for quick user lookup
      const usersMap = new Map((users || []).map(user => [user.id, user]));

      // If user is logged in, fetch their reactions and saved posts
      let userReactions: any[] = [];
      let userSavedPosts: any[] = [];
      
      if (user) {
        const postIds = posts.map(post => post.id);
        
        // Fetch user's reactions
        const { data: reactions, error: reactionsError } = await supabase
          .from('reactions')
          .select('post_id, reaction_type')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        if (reactionsError) {
          console.error('Error fetching reactions:', reactionsError);
        } else {
          userReactions = reactions || [];
        }
        
        // Fetch user's saved posts
        const { data: savedPosts, error: savedError } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
          
        if (savedError) {
          console.error('Error fetching saved posts:', savedError);
        } else {
          userSavedPosts = savedPosts || [];
        }
      }

      // Create maps for quick lookup
      const likesMap = new Map(userReactions.filter(r => r.reaction_type === 'like').map(r => [r.post_id, true]));
      const savedMap = new Map(userSavedPosts.map(s => [s.post_id, true]));

      // Combine posts with user data and interaction states
      const postsWithData = posts.map(post => {
        const userData = usersMap.get(post.user_id);
        return {
          ...post,
          users: userData || {
            id: post.user_id,
            username: 'Anonymous',
            avatar_url: null,
            display_name: 'Anonymous'
          },
          isLikedByUser: likesMap.has(post.id),
          isSavedByUser: savedMap.has(post.id)
        };
      });

      console.log('Posts with data:', postsWithData.length);
      return postsWithData;
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
          likes_count: 0,
          comments_count: 0,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }
      
      console.log('Post created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User must be logged in');
      
      console.log('Toggling like for post:', postId);
      
      // Check if user already liked the post - use maybeSingle instead of single to avoid 406 errors
      const { data: existingLike, error: fetchError } = await supabase
        .from('reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', 'like')
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking like status:', fetchError);
        throw fetchError;
      }

      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingLike.id);
        
        if (deleteError) {
          console.error('Error unliking post:', deleteError);
          throw deleteError;
        }
        
        // Decrement likes_count in posts table using raw SQL for atomic update
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.raw('GREATEST(likes_count - 1, 0)') })
          .eq('id', postId);
        
        if (updateError) {
          console.error('Error updating post likes count:', updateError);
          // Try again with a different approach if the first one fails
          try {
            // Get current count and update
            const { data: postData } = await supabase
              .from('posts')
              .select('likes_count')
              .eq('id', postId)
              .maybeSingle();
            
            if (postData) {
              const currentLikes = postData.likes_count || 0;
              await supabase
                .from('posts')
                .update({ likes_count: Math.max(0, currentLikes - 1) })
                .eq('id', postId);
            }
          } catch (fallbackError) {
            console.error('Fallback update also failed:', fallbackError);
            // Continue even if update fails to maintain user experience
          }
        }
        
        console.log('Post unliked');
        return { action: 'unliked' };
      } else {
        // Like the post
        const { error: insertError } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: 'like'
          });
        
        if (insertError) {
          console.error('Error liking post:', insertError);
          throw insertError;
        }
        
        // Increment likes_count in posts table using raw SQL for atomic update
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.raw('likes_count + 1') })
          .eq('id', postId);
        
        if (updateError) {
          console.error('Error updating post likes count:', updateError);
          // Try again with a different approach if the first one fails
          try {
            // Get current count and update
            const { data: postData } = await supabase
              .from('posts')
              .select('likes_count')
              .eq('id', postId)
              .maybeSingle();
            
            if (postData) {
              const currentLikes = postData.likes_count || 0;
              await supabase
                .from('posts')
                .update({ likes_count: currentLikes + 1 })
                .eq('id', postId);
            }
          } catch (fallbackError) {
            console.error('Fallback update also failed:', fallbackError);
            // Continue even if update fails to maintain user experience
          }
        }
        
        console.log('Post liked');
        return { action: 'liked' };
      }
    },
    onSuccess: (_, postId) => {
      // Invalidate all related queries to ensure UI updates correctly
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      
      // Force a refetch to ensure the latest data
      queryClient.refetchQueries({ queryKey: ['posts'] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User must be logged in');
      
      console.log('Toggling save for post:', postId);
      
      // Check if post is already saved
      const { data: existingSave } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSave) {
        // Unsave the post
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('id', existingSave.id);
        
        if (error) {
          console.error('Error unsaving post:', error);
          throw error;
        }
        
        console.log('Post unsaved');
        return { action: 'unsaved' };
      } else {
        // Save the post
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) {
          console.error('Error saving post:', error);
          throw error;
        }
        
        console.log('Post saved');
        return { action: 'saved' };
      }
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
};

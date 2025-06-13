
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSearchHistory = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['searchHistory', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAddSearchHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (query: string) => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          query: query.trim()
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
};

export const useSearchPosts = (query: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['searchPosts', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // First fetch posts with their stats
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_stats (
            likes_count,
            comments_count,
            views_count
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,prompt.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!posts || posts.length === 0) return [];

      // Get unique user IDs from posts
      const userIds = [...new Set(posts.map(post => post.user_id))];
      
      // Fetch user data for all authors
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, avatar_url, display_name')
        .in('id', userIds);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
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
        const postStats = post.post_stats?.[0] || { likes_count: 0, comments_count: 0, views_count: 0 };
        
        return {
          ...post,
          users: userData || {
            id: post.user_id,
            username: 'Anonymous',
            avatar_url: null,
            display_name: 'Anonymous'
          },
          likes_count: postStats.likes_count,
          comments_count: postStats.comments_count,
          views_count: postStats.views_count,
          isLikedByUser: likesMap.has(post.id),
          isSavedByUser: savedMap.has(post.id)
        };
      });

      return postsWithData;
    },
    enabled: !!query.trim(),
  });
};

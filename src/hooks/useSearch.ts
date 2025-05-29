
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
  return useQuery({
    queryKey: ['searchPosts', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (username, avatar_url)
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,prompt.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!query.trim(),
  });
};

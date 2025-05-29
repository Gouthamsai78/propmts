
import { useState, useEffect } from "react";
import { Search as SearchIcon, Clock, TrendingUp } from "lucide-react";
import { useSearchHistory, useAddSearchHistory, useSearchPosts } from "@/hooks/useSearch";
import { PromptCard } from "./PromptCard";
import { useAuth } from "@/contexts/AuthContext";

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { user } = useAuth();
  const { data: searchHistory } = useSearchHistory();
  const { data: searchResults } = useSearchPosts(debouncedQuery);
  const addSearchHistoryMutation = useAddSearchHistory();

  const trendingTags = [
    "chatgpt", "midjourney", "coding", "creative", "writing", 
    "productivity", "design", "photography", "business", "education"
  ];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && user) {
      addSearchHistoryMutation.mutate(query);
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      <div className="py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Search</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search prompts, users, communities..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Search Results</h3>
          {searchResults.map((post) => (
            <PromptCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                description: post.content || '',
                prompt: post.prompt || '',
                tags: post.category ? post.category.split(',').map(tag => tag.trim()) : [],
                author: (post.users as any)?.username || 'Anonymous',
                authorAvatar: (post.users as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(post.users as any)?.username || 'anonymous'}`,
                likes: post.likes_count || 0,
                comments: post.comments_count || 0,
                image: post.image_url,
                allowCopy: post.allow_copy ?? true,
                timestamp: new Date(post.created_at).toLocaleDateString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  month: 'short',
                  day: 'numeric'
                })
              }}
              onCopyPrompt={() => {}}
              onLike={() => {}}
              onSave={() => {}}
            />
          ))}
        </div>
      )}

      {/* Recent Searches */}
      {user && searchHistory && searchHistory.length > 0 && !debouncedQuery && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Recent</h3>
          </div>
          <div className="space-y-2">
            {searchHistory.map((search) => (
              <button
                key={search.id}
                onClick={() => handleHistoryClick(search.query)}
                className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {search.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Tags */}
      {!debouncedQuery && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Trending</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleSearch(tag)}
                className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 rounded-full text-sm font-medium hover:from-purple-100 hover:to-blue-100 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

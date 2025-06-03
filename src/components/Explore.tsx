
import { useState } from "react";
import { PromptCard } from "./PromptCard";
import { usePosts, useLikePost, useSavePost } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";

interface ExploreProps {
  onUserClick?: (userId: string) => void;
}

export const Explore = ({ onUserClick }: ExploreProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: posts, isLoading } = usePosts();
  const { toast } = useToast();
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();

  const categories = [
    "all",
    "chatgpt",
    "midjourney", 
    "coding",
    "creative",
    "writing",
    "productivity",
    "design",
    "photography",
    "business",
    "education"
  ];

  const filteredPosts = posts?.filter(post => {
    if (selectedCategory === "all") return true;
    const postCategories = post.category ? post.category.toLowerCase().split(',').map(cat => cat.trim()) : [];
    return postCategories.includes(selectedCategory.toLowerCase());
  }) || [];

  // Helper function to parse media URLs
  const parseMediaUrls = (imageUrl: string | null): string[] => {
    if (!imageUrl) return [];
    
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [imageUrl];
    } catch {
      // If parsing fails, treat as single URL
      return [imageUrl];
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied!",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await likePostMutation.mutateAsync(postId);
      toast({
        title: result.action === 'liked' ? "Liked!" : "Unliked!",
        description: result.action === 'liked' ? "Post added to your likes." : "Post removed from your likes.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const result = await savePostMutation.mutateAsync(postId);
      toast({
        title: result.action === 'saved' ? "Saved!" : "Unsaved!",
        description: result.action === 'saved' ? "Post saved to your collection." : "Post removed from your collection.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Explore</h2>
        <p className="text-gray-600">Discover amazing prompts by category</p>
      </div>

      {/* Category Filter */}
      <div className="flex overflow-x-auto space-x-3 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PromptCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                content: post.content || '',
                prompt: post.prompt || '',
                category: post.category || '',
                author: (post.users as any)?.display_name || (post.users as any)?.username || 'Anonymous',
                authorAvatar: (post.users as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(post.users as any)?.username || 'anonymous'}`,
                authorId: post.user_id,
                likes_count: post.likes_count || 0,
                comments_count: post.comments_count || 0,
                image_url: post.image_url,
                media_urls: parseMediaUrls(post.image_url),
                allow_copy: post.allow_copy ?? true,
                timestamp: new Date(post.created_at).toLocaleDateString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  month: 'short',
                  day: 'numeric'
                }),
                isLikedByUser: (post as any).isLikedByUser || false,
                isSavedByUser: (post as any).isSavedByUser || false
              }}
              onCopyPrompt={() => handleCopyPrompt(post.prompt || '')}
              onLike={() => handleLike(post.id)}
              onSave={() => handleSave(post.id)}
              onAuthorClick={onUserClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No posts found in this category.</p>
        </div>
      )}
    </div>
  );
};

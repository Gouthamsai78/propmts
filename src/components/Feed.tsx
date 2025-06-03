
import { useState } from "react";
import { usePosts, useLikePost, useSavePost } from "@/hooks/usePosts";
import { PromptCard } from "./PromptCard";
import { Tools } from "./Tools";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedProps {
  onUserClick?: (userId: string) => void;
}

export const Feed = ({ onUserClick }: FeedProps) => {
  const { data: posts, isLoading, error } = usePosts();
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();
  const { toast } = useToast();

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard!",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePostMutation.mutateAsync(postId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      await savePostMutation.mutateAsync(postId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8 text-red-500">
          Error loading posts. Please try again.
        </div>
      </div>
    );
  }

  // Filter posts by type
  const promptPosts = posts?.filter(post => !post.category?.toLowerCase().includes('tool')) || [];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Home Feed</h2>
        <p className="text-gray-600">Latest posts from the community</p>
      </div>

      <Tabs defaultValue="prompts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompts" className="space-y-4">
          {promptPosts && promptPosts.length > 0 ? (
            promptPosts.map((post) => (
              <PromptCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content || "",
                  prompt: post.prompt || "",
                  category: post.category || "",
                  author: post.users?.display_name || post.users?.username || "Anonymous",
                  authorAvatar: post.users?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.users?.username || 'anonymous'}`,
                  authorId: post.user_id,
                  likes_count: post.likes_count || 0,
                  comments_count: post.comments_count || 0,
                  image_url: post.image_url || undefined,
                  media_urls: parseMediaUrls(post.image_url),
                  allow_copy: post.allow_copy ?? true,
                  timestamp: new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }),
                  isLikedByUser: post.isLikedByUser,
                  isSavedByUser: post.isSavedByUser
                }}
                onCopyPrompt={() => handleCopyPrompt(post.prompt || "")}
                onLike={() => handleLikePost(post.id)}
                onSave={() => handleSavePost(post.id)}
                onAuthorClick={onUserClick}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No prompt posts found. Be the first to create a prompt post!
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tools">
          <Tools />
        </TabsContent>
      </Tabs>
    </div>
  );
};

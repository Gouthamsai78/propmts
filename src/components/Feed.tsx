
import { useState } from "react";
import { usePosts, useLikePost, useSavePost } from "@/hooks/usePosts";
import { PromptCard } from "./PromptCard";
import { CreatePost } from "./CreatePost";
import { useToast } from "@/hooks/use-toast";

export const Feed = () => {
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

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <CreatePost />
      
      {posts && posts.length > 0 ? (
        posts.map((post) => (
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
              media_urls: post.image_url ? [post.image_url] : [],
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
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No posts found. Be the first to create a post!
        </div>
      )}
    </div>
  );
};

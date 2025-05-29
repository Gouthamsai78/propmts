
import { useState } from "react";
import { PromptCard } from "./PromptCard";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";

export const Feed = () => {
  const { data: posts, isLoading, error } = usePosts();
  const { toast } = useToast();

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied!",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  const handleLike = (postId: string) => {
    toast({
      title: "Liked!",
      description: "Post added to your likes.",
    });
  };

  const handleSave = (postId: string) => {
    toast({
      title: "Saved!",
      description: "Post saved to your collection.",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Discover Prompts</h2>
          <p className="text-gray-600">Fuel your AI journey</p>
        </div>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
        <p className="text-gray-600">Unable to load posts. Please try again later.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Posts Yet</h2>
        <p className="text-gray-600">Be the first to share a prompt! Create your first post to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Discover Prompts</h2>
        <p className="text-gray-600">Fuel your AI journey</p>
      </div>
      
      {posts.map((post) => (
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
          onCopyPrompt={() => handleCopyPrompt(post.prompt || '')}
          onLike={() => handleLike(post.id)}
          onSave={() => handleSave(post.id)}
        />
      ))}
    </div>
  );
};


import { PromptCard } from "./PromptCard";
import { useToast } from "@/hooks/use-toast";
import { usePosts, useLikePost, useSavePost } from "@/hooks/usePosts";

interface FeedProps {
  onUserClick?: (userId: string) => void;
}

export const Feed = ({ onUserClick }: FeedProps) => {
  const { data: posts, isLoading, error } = usePosts();
  const { toast } = useToast();
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();

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
    console.error('Feed error:', error);
    return (
      <div className="max-w-md mx-auto px-4 text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
        <p className="text-gray-600">Unable to load posts. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
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
            author: (post.users as any)?.display_name || (post.users as any)?.username || 'Anonymous',
            authorAvatar: (post.users as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(post.users as any)?.username || 'anonymous'}`,
            authorId: post.user_id,
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
            }),
            isLiked: (post as any).isLikedByUser || false,
            isSaved: (post as any).isSavedByUser || false
          }}
          onCopyPrompt={() => handleCopyPrompt(post.prompt || '')}
          onLike={() => handleLike(post.id)}
          onSave={() => handleSave(post.id)}
          onAuthorClick={onUserClick}
        />
      ))}
    </div>
  );
};

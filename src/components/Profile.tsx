
import { useState } from "react";
import { Edit3, Settings, Bookmark, Grid3X3 } from "lucide-react";
import { useUserProfile, useUserPosts, useSavedPosts } from "@/hooks/useUserProfile";
import { PromptCard } from "./PromptCard";
import { EditProfile } from "./EditProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLikePost, useSavePost } from "@/hooks/usePosts";

interface ProfileProps {
  userId?: string;
  onUserClick?: (userId: string) => void;
}

export const Profile = ({ userId, onUserClick }: ProfileProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isOwnProfile = !userId || userId === user?.id;
  const { data: profile } = useUserProfile();
  const { data: userPosts } = useUserPosts(userId);
  const { data: savedPosts } = useSavedPosts();
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();

  const displayProfile = profile; // For now, only show own profile
  const displayPosts = activeTab === 'posts' ? userPosts : savedPosts;

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

  if (showEditProfile) {
    return <EditProfile onBack={() => setShowEditProfile(false)} />;
  }

  if (!displayProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={displayProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayProfile.username}`}
              alt={displayProfile.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {displayProfile.display_name || displayProfile.username}
              </h2>
              <p className="text-gray-600">@{displayProfile.username}</p>
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setShowEditProfile(true)}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </div>

        {displayProfile.bio && (
          <p className="text-gray-700 mb-4">{displayProfile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex justify-around pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{displayProfile.posts_count || 0}</p>
            <p className="text-sm text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{displayProfile.followers_count || 0}</p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{displayProfile.following_count || 0}</p>
            <p className="text-sm text-gray-600">Following</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {isOwnProfile && (
        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-colors ${
              activeTab === 'posts'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="font-medium">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-colors ${
              activeTab === 'saved'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">Saved</span>
          </button>
        </div>
      )}

      {/* Posts Grid */}
      <div className="space-y-4">
        {displayPosts && displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PromptCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                description: post.content || '',
                prompt: post.prompt || '',
                tags: post.category ? post.category.split(',').map(tag => tag.trim()) : [],
                author: (post.users as any)?.display_name || (post.users as any)?.username || displayProfile.display_name || displayProfile.username,
                authorAvatar: (post.users as any)?.avatar_url || displayProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayProfile.username}`,
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
              showFollowButton={false}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>
              {activeTab === 'posts' 
                ? isOwnProfile 
                  ? "You haven't created any posts yet." 
                  : "This user hasn't created any posts yet."
                : "No saved posts yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

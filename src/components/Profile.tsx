
import { useState } from "react";
import { Settings, Grid, Bookmark, Crown } from "lucide-react";
import { useUserProfile, useUserPosts, useSavedPosts } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

export const Profile = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { data: userPosts } = useUserPosts();
  const { data: savedPosts } = useSavedPosts();

  if (!user || !userProfile) {
    return (
      <div className="max-w-md mx-auto px-4 text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in</h2>
        <p className="text-gray-600">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={userProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`}
            alt={userProfile.display_name || userProfile.username}
            className="w-20 h-20 rounded-full object-cover border-4 border-gradient-to-r from-purple-500 to-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-800">{userProfile.display_name || userProfile.username}</h3>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-600">@{userProfile.username}</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{userProfile.bio || "AI enthusiast sharing creative prompts ✨"}</p>
        
        {/* Stats */}
        <div className="flex items-center justify-around py-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{userProfile.posts_count || userPosts?.length || 0}</p>
            <p className="text-sm text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{userProfile.followers_count || 0}</p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{userProfile.following_count || 0}</p>
            <p className="text-sm text-gray-600">Following</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          <button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold">
            Edit Profile
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            Share Profile
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 transition-colors ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="font-medium">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 transition-colors ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">Saved</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-4">
          {activeTab === 'posts' && (
            <div>
              {userPosts && userPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {userPosts.map((post) => (
                    <div key={post.id} className="relative aspect-square group">
                      <img
                        src={post.image_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300"}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          {post.likes_count || 0} likes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Grid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No posts yet</p>
                  <p className="text-sm text-gray-400">Share your first prompt to get started</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'saved' && (
            <div>
              {savedPosts && savedPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {savedPosts.map((savedPost) => (
                    <div key={savedPost.id} className="relative aspect-square group">
                      <img
                        src={(savedPost.posts as any)?.image_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300"}
                        alt={(savedPost.posts as any)?.title || "Saved post"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          {(savedPost.posts as any)?.likes_count || 0} likes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No saved posts yet</p>
                  <p className="text-sm text-gray-400">Posts you save will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

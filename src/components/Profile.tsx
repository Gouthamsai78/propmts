
import { useState } from "react";
import { Settings, Grid, Bookmark, Crown } from "lucide-react";

const mockUser = {
  username: "sarah_prompts",
  displayName: "Sarah Chen",
  bio: "AI enthusiast sharing creative prompts for writers and developers ✨",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
  followers: 1250,
  following: 340,
  posts: 28,
  isVerified: true
};

const mockUserPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300",
    likes: 234
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
    likes: 189
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300",
    likes: 156
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300",
    likes: 98
  }
];

export const Profile = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

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
            src={mockUser.avatar}
            alt={mockUser.displayName}
            className="w-20 h-20 rounded-full object-cover border-4 border-gradient-to-r from-purple-500 to-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-800">{mockUser.displayName}</h3>
              {mockUser.isVerified && (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <p className="text-gray-600">@{mockUser.username}</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{mockUser.bio}</p>
        
        {/* Stats */}
        <div className="flex items-center justify-around py-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{mockUser.posts}</p>
            <p className="text-sm text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{mockUser.followers}</p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{mockUser.following}</p>
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
            <div className="grid grid-cols-2 gap-2">
              {mockUserPosts.map((post) => (
                <div key={post.id} className="relative aspect-square group">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {post.likes} likes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'saved' && (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No saved posts yet</p>
              <p className="text-sm text-gray-400">Posts you save will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

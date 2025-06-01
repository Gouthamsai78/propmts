
import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Copy, MoreHorizontal, UserPlus } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Comments } from "./Comments";

interface Post {
  id: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  authorId?: string;
  likes: number;
  comments: number;
  image?: string;
  allowCopy: boolean;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface PromptCardProps {
  post: Post;
  onCopyPrompt: () => void;
  onLike: () => void;
  onSave: () => void;
  onAuthorClick?: (authorId: string) => void;
  showFollowButton?: boolean;
}

export const PromptCard = ({ 
  post, 
  onCopyPrompt, 
  onLike, 
  onSave, 
  onAuthorClick,
  showFollowButton = true 
}: PromptCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiked(!isLiked);
    onLike();
  };

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save posts.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaved(!isSaved);
    onSave();
  };

  const handleAuthorClick = () => {
    if (post.authorId && onAuthorClick) {
      onAuthorClick(post.authorId);
    }
  };

  const handleComments = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to view comments.",
        variant: "destructive",
      });
      return;
    }
    setShowComments(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-3">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={handleAuthorClick}
            />
            <div>
              <p 
                className="font-semibold text-gray-800 cursor-pointer hover:text-purple-600"
                onClick={handleAuthorClick}
              >
                {post.author}
              </p>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showFollowButton && post.authorId && user?.id !== post.authorId && (
              <button className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600 transition-colors">
                <UserPlus className="w-4 h-4" />
                <span>Follow</span>
              </button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Image */}
        {post.image && (
          <div className="relative">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
            {post.allowCopy && post.prompt && (
              <button
                onClick={onCopyPrompt}
                className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2">{post.title}</h3>
          {post.description && (
            <p className="text-gray-600 mb-3">{post.description}</p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Prompt */}
          {post.prompt && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Prompt</span>
                {post.allowCopy && (
                  <button
                    onClick={onCopyPrompt}
                    className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                )}
              </div>
              <p className={`text-gray-800 text-sm leading-relaxed ${
                !showFullPrompt && post.prompt.length > 150 ? 'line-clamp-3' : ''
              }`}>
                {post.prompt}
              </p>
              {post.prompt.length > 150 && (
                <button
                  onClick={() => setShowFullPrompt(!showFullPrompt)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2"
                >
                  {showFullPrompt ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                <span className="text-sm font-medium text-gray-700">{post.likes}</span>
              </button>
              <button 
                onClick={handleComments}
                className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{post.comments}</span>
              </button>
            </div>
            <button
              onClick={handleSave}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-purple-500 text-purple-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>

      <Comments 
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
};

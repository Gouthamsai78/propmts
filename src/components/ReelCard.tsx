
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Bookmark, Copy, Eye } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useLikePost, useSavePost } from "@/hooks/usePosts";
import { Comments } from "./Comments";

interface Post {
  id: string;
  title: string;
  content: string;
  prompt: string;
  author: string;
  authorAvatar: string;
  authorId?: string;
  likes_count: number;
  comments_count: number;
  views_count?: number;
  image_url?: string;
  media_urls?: string[];
  allow_copy: boolean;
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
}

interface ReelCardProps {
  post: Post;
}

export const ReelCard = ({ post }: ReelCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [isSaved, setIsSaved] = useState(post.isSavedByUser || false);
  const [showComments, setShowComments] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  useEffect(() => {
    setIsLiked(post.isLikedByUser || false);
  }, [post.isLikedByUser]);

  useEffect(() => {
    setIsSaved(post.isSavedByUser || false);
  }, [post.isSavedByUser]);

  const handleLike = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to like posts.", variant: "destructive" });
      return;
    }
    setIsLiked(!isLiked);
    likeMutation.mutate(post.id);
  };

  const handleSave = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to save posts.", variant: "destructive" });
      return;
    }
    setIsSaved(!isSaved);
    saveMutation.mutate(post.id);
  };
  
  const handleCopyPrompt = () => {
    if (!post.prompt) return;
    navigator.clipboard.writeText(post.prompt);
    toast({
      title: "Prompt Copied!",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  const handleComments = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to view comments.", variant: "destructive" });
      return;
    }
    setShowComments(true);
  };

  const mediaUrl = post.media_urls?.[0] || post.image_url;
  const isVideo = mediaUrl?.match(/\.(mp4|webm)$/i);
  
  return (
    <>
      <div className="w-full h-full relative text-white">
        {/* Media Background */}
        {mediaUrl ? (
          isVideo ? (
              <video
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
              />
          ) : (
              <img src={mediaUrl} alt={post.title} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p>No media available</p>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/40"></div>
        
        {/* Top Right Controls */}
        <div className="absolute top-6 right-4">
            {post.prompt && post.allow_copy && (
                <button
                    onClick={handleCopyPrompt}
                    className="p-3 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors"
                >
                    <Copy className="w-5 h-5" />
                </button>
            )}
        </div>

        {/* Side Action Bar */}
        <div className="absolute bottom-28 right-2 flex flex-col items-center space-y-5">
            <button onClick={handleLike} className="flex flex-col items-center space-y-1 text-center">
                <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full">
                    <Heart className={`w-6 h-6 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </div>
                <span className="text-xs font-semibold">{post.likes_count?.toLocaleString()}</span>
            </button>
            <button onClick={handleComments} className="flex flex-col items-center space-y-1 text-center">
                <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold">{post.comments_count?.toLocaleString()}</span>
            </button>
            <button onClick={handleSave} className="flex flex-col items-center space-y-1 text-center">
                <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full">
                     <Bookmark className={`w-6 h-6 transition-all ${isSaved ? 'fill-white text-white' : ''}`} />
                </div>
                <span className="text-xs font-semibold">Save</span>
            </button>
            <div className="flex flex-col items-center space-y-1 text-center">
                <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full">
                     <Eye className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold">{post.views_count?.toLocaleString() || 0}</span>
            </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-28 left-4 right-20 space-y-2">
            <div className="flex items-center space-x-2">
                <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-full border-2 border-white" />
                <p className="font-bold">{post.author}</p>
            </div>
            <h3 className="font-semibold text-lg">{post.title}</h3>
            <p className="text-sm text-gray-200 line-clamp-2">{post.content}</p>
            {post.prompt && (
                 <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg mt-2">
                     <p className="text-sm font-mono line-clamp-2">{post.prompt}</p>
                 </div>
            )}
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

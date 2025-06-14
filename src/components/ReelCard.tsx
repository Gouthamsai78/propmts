import { useState } from "react";
import { Copy } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useLikePost, useSavePost } from "@/hooks/usePosts";
import { Comments } from "./Comments";
import { ReelMedia } from "./ReelMedia";
import { ReelContentPanel } from "./ReelContentPanel";
import { ReelSideActions } from "./ReelSideActions";

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
  allow_copy: boolean;
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
}

interface ReelCardProps {
  post: Post;
  active?: boolean; // receives whether this reel is the visible one
}

// This file delegates most UI to subcomponents for maintainability.

export const ReelCard = ({ post, active = false }: ReelCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [isSaved, setIsSaved] = useState(post.isSavedByUser || false);
  const [showComments, setShowComments] = useState(false);
  const [showAllContent, setShowAllContent] = useState(false);
  const [showAllPrompt, setShowAllPrompt] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  // Sync like/save states if prop changes
  useEffect(() => {
    setIsLiked(post.isLikedByUser || false);
  }, [post.isLikedByUser]);
  useEffect(() => {
    setIsSaved(post.isSavedByUser || false);
  }, [post.isSavedByUser]);

  // Only play/unmute video & show sound when 'active', otherwise pause/mute
  // Media parsing: array string or direct string
  let mediaUrl: string | undefined = undefined;
  if (post.image_url) {
    try {
      if (post.image_url.startsWith("[")) {
        const arr = JSON.parse(post.image_url);
        if (Array.isArray(arr) && arr[0]) {
          mediaUrl = arr[0];
        }
      } else {
        mediaUrl = post.image_url;
      }
    } catch (e) {
      mediaUrl = post.image_url;
    }
  }
  const isVideo = mediaUrl?.match(/\.(mp4|webm|mov|avi)$/i) ? true : false;

  // Action handlers
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
  // Media error callback
  const [mediaError, setMediaError] = useState<string | null>(null);

  return (
    <>
      <div className="w-full h-full relative text-white">
        {/* Media */}
        <ReelMedia
          mediaUrl={mediaUrl}
          title={post.title}
          isVideo={isVideo}
          active={active}
          onError={setMediaError}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/40 pointer-events-none"></div>

        {/* Top Right Copy Button */}
        <div className="absolute top-6 right-4 z-30">
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
        <ReelSideActions
          isLiked={isLiked}
          isSaved={isSaved}
          likesCount={post.likes_count}
          commentsCount={post.comments_count}
          viewsCount={post.views_count}
          handleLike={handleLike}
          handleSave={handleSave}
          handleComments={handleComments}
        />

        {/* Bottom Content Panel */}
        <ReelContentPanel
          authorAvatar={post.authorAvatar}
          author={post.author}
          title={post.title}
          content={post.content}
          prompt={post.prompt}
          showAllContent={showAllContent}
          setShowAllContent={setShowAllContent}
          showAllPrompt={showAllPrompt}
          setShowAllPrompt={setShowAllPrompt}
          allow_copy={post.allow_copy}
          handleCopyPrompt={handleCopyPrompt}
        />
      </div>
      <Comments
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
};

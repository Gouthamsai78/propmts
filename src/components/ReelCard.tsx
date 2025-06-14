import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Bookmark, Copy, Eye, Maximize2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useLikePost, useSavePost } from "@/hooks/usePosts";
import { Comments } from "./Comments";
import { AspectRatio } from "./ui/aspect-ratio";

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

// This file is getting large! Please consider splitting out media/player and content panels into separate files.

export const ReelCard = ({ post, active = false }: ReelCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [isSaved, setIsSaved] = useState(post.isSavedByUser || false);
  const [showComments, setShowComments] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  // Read More state for both content and prompt
  const [showAllContent, setShowAllContent] = useState(false);
  const [showAllPrompt, setShowAllPrompt] = useState(false);

  // For fullscreen video
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Main fix: Only play/unmute when 'active', otherwise pause/mute
  useEffect(() => {
    if (videoRef.current) {
      if (active) {
        videoRef.current.play().catch(() => {});
        videoRef.current.muted = false;
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
      }
    }
  }, [active]);

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

  // ----- MEDIA URL EXTRACT FIX -----
  // image_url might be direct string or JSON array as a string
  let mediaUrl: string | undefined = undefined;
  if (!post.image_url) {
    mediaUrl = undefined;
  } else {
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
  const isVideo = mediaUrl?.match(/\.(mp4|webm|mov|avi)$/i);

  // Handler for video errors
  const handleVideoError = () => {
    setMediaError("Failed to play video. The file may not be a valid video, or it may not be accessible.");
  };
  // Handle fullscreen
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  // Clamp and show "Read more" if it's long
  const clampContent = !showAllContent ? "line-clamp-2" : "";
  const clampPrompt = !showAllPrompt ? "line-clamp-2" : "";
  const SHOW_CONTENT_READ_MORE = post.content && post.content.length > 100;
  const SHOW_PROMPT_READ_MORE = post.prompt && post.prompt.length > 80;

  return (
    <>
      <div className="w-full h-full relative text-white">
        {/* Media Background */}
        <AspectRatio ratio={9 / 16} className="w-full h-full bg-black">
          {mediaUrl ? (
            isVideo ? (
              <>
                <div className="relative w-full h-full bg-black">
                  <video
                    key={mediaUrl}
                    ref={videoRef}
                    src={mediaUrl}
                    className="w-full h-full object-contain"
                    autoPlay={active}
                    loop
                    controls
                    muted={!active}
                    preload="auto"
                    onError={handleVideoError}
                    style={{ background: "black" }}
                  />
                  {/* Fullscreen button */}
                  <button
                    className="absolute top-2 right-2 p-2 bg-black/60 rounded-full z-20 hover:bg-black/80 transition"
                    onClick={handleFullscreen}
                    aria-label="Fullscreen"
                    type="button"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  {/* Error/debug info */}
                  {mediaError && (
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs z-20 text-red-400">
                      {mediaError}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <img src={mediaUrl} alt={post.title} className="w-full h-full object-contain bg-black" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <p>No media available</p>
            </div>
          )}
        </AspectRatio>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/40 pointer-events-none"></div>

        {/* Top Right Controls */}
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
        <div className="absolute bottom-28 right-2 flex flex-col items-center space-y-5 z-30">
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
        <div className="absolute bottom-24 left-4 right-20 space-y-2 z-30">
          <div className="flex items-center space-x-2">
            <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-full border-2 border-white" />
            <p className="font-bold">{post.author}</p>
          </div>
          <h3 className="font-semibold text-lg">{post.title}</h3>
          {post.content && (
            <p className={`text-sm text-gray-200 ${clampContent}`}>
              {showAllContent ? post.content : post.content.slice(0, 150)}
              {!showAllContent && SHOW_CONTENT_READ_MORE && (
                <>...{" "}
                <button
                  onClick={() => setShowAllContent(true)}
                  className="underline text-blue-200 font-medium ml-1 text-xs"
                >
                  Read more
                </button>
                </>
              )}
              {showAllContent && SHOW_CONTENT_READ_MORE && (
                <button
                  onClick={() => setShowAllContent(false)}
                  className="underline text-blue-200 font-medium ml-2 text-xs"
                >
                  Read less
                </button>
              )}
            </p>
          )}
          {post.prompt && (
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg mt-2">
              <span className={`text-sm font-mono text-white ${clampPrompt}`}>
                {showAllPrompt ? post.prompt : post.prompt.slice(0, 120)}
                {!showAllPrompt && SHOW_PROMPT_READ_MORE && (
                  <>...{" "}
                  <button
                    onClick={() => setShowAllPrompt(true)}
                    className="underline text-blue-200 font-medium ml-1 text-xs"
                  >
                    Read more
                  </button>
                  </>
                )}
                {showAllPrompt && SHOW_PROMPT_READ_MORE && (
                  <button
                    onClick={() => setShowAllPrompt(false)}
                    className="underline text-blue-200 font-medium ml-2 text-xs"
                  >
                    Read less
                  </button>
                )}
              </span>
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

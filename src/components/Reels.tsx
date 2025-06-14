
import { usePosts } from "@/hooks/usePosts";
import { ReelCard } from "./ReelCard";
import { Loader2, VideoOff } from "lucide-react";

export const Reels = () => {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="h-screen w-full flex items-center justify-center bg-black text-white">Error loading reels.</div>;
  }

  // A reel must have some visual media.
  const reelPosts = posts?.filter(p => (p.media_urls && p.media_urls.length > 0) || p.image_url);

  if (!reelPosts || reelPosts.length === 0) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white text-center px-4">
            <VideoOff className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold">No Reels Yet</h3>
            <p className="text-gray-400">Create a post with an image to see it here!</p>
        </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar">
      {reelPosts.map((post) => (
        <div key={post.id} className="h-screen w-full snap-start relative flex items-center justify-center bg-black">
          <ReelCard post={post} />
        </div>
      ))}
    </div>
  );
};


import { useEffect, useRef, useState } from "react";
import { usePosts } from "@/hooks/usePosts";
import { ReelCard } from "./ReelCard";
import { Loader2, VideoOff } from "lucide-react";

/**
 * Utilities to detect which reel is most visible in the viewport
 */
function getCurrentReelIndex(reelRefs: React.RefObject<HTMLDivElement>[]) {
  if (typeof window === "undefined") return 0;
  const vh = window.innerHeight;
  let maxVisible = 0;
  let visibleIdx = 0;
  for (let i = 0; i < reelRefs.length; i++) {
    const ref = reelRefs[i].current;
    if (!ref) continue;
    const rect = ref.getBoundingClientRect();
    const visibleHeight =
      Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    if (visibleHeight > maxVisible) {
      maxVisible = visibleHeight;
      visibleIdx = i;
    }
  }
  return visibleIdx;
}

export const Reels = () => {
  const { data: posts, isLoading, error } = usePosts();
  const [activeIdx, setActiveIdx] = useState(0);

  // _____ reels tracking refs for each item
  // A post is a reel if media_urls (nonempty) or image_url exists
  const reelPosts = posts?.filter(
    (p) => (p.media_urls && p.media_urls.length > 0) || p.image_url
  );

  const reelRefs =
    reelPosts?.map(() => useRef<HTMLDivElement>(null)) || [];

  // On scroll, track which reel is most visible
  useEffect(() => {
    const onScroll = () => {
      setActiveIdx(getCurrentReelIndex(reelRefs));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  // initial set
  useEffect(() => {
    setActiveIdx(getCurrentReelIndex(reelRefs));
  }, [posts]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        Error loading reels.
      </div>
    );
  }

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
      {reelPosts.map((post, i) => (
        <div
          key={post.id}
          ref={reelRefs[i]}
          className="h-screen w-full snap-start relative flex items-center justify-center bg-black"
        >
          <ReelCard post={post} active={i === activeIdx} />
        </div>
      ))}
    </div>
  );
};

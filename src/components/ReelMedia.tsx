
import { useRef, useEffect, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { Maximize2 } from "lucide-react";

interface ReelMediaProps {
  mediaUrl?: string;
  title: string;
  isVideo: boolean;
  active: boolean;
  onError: (err: string) => void;
}

export const ReelMedia = ({
  mediaUrl,
  title,
  isVideo,
  active,
  onError,
}: ReelMediaProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Play/mute logic
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

  const handleVideoError = () => {
    const msg =
      "Failed to play video. The file may not be a valid video, or it may not be accessible.";
    setMediaError(msg);
    onError(msg);
  };

  return (
    <AspectRatio ratio={9 / 16} className="w-full h-full bg-black">
      {mediaUrl ? (
        isVideo ? (
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
        ) : (
          <img
            src={mediaUrl}
            alt={title}
            className="w-full h-full object-contain bg-black"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <p>No media available</p>
        </div>
      )}
    </AspectRatio>
  );
};

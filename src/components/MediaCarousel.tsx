
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MediaCarouselProps {
  mediaUrls: string[];
  onRemove?: (index: number) => void;
  editable?: boolean;
}

export const MediaCarousel = ({ mediaUrls, onRemove, editable = false }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.webm');
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? mediaUrls.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === mediaUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(index);
      if (currentIndex >= mediaUrls.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Main media display */}
      <div className="relative w-full h-auto bg-gray-50 rounded-lg overflow-hidden">
        {isVideo(mediaUrls[currentIndex]) ? (
          <video
            src={mediaUrls[currentIndex]}
            controls
            className="w-full h-auto max-h-[500px] object-contain"
            onError={() => console.error('Video failed to load')}
          />
        ) : (
          <img
            src={mediaUrls[currentIndex]}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-auto max-h-[500px] object-contain"
            onError={() => console.error('Image failed to load')}
          />
        )}

        {/* Remove button */}
        {editable && onRemove && (
          <button
            onClick={(e) => handleRemove(currentIndex, e)}
            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Navigation arrows */}
        {mediaUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white transition-all shadow-lg border border-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white transition-all shadow-lg border border-gray-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Media counter */}
        {mediaUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-gray-200">
            {currentIndex + 1} / {mediaUrls.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip - without black background */}
      {mediaUrls.length > 1 && (
        <div className="mt-3 px-2">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {mediaUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isVideo(url) ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

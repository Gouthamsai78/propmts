
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
    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
      {/* Main media display */}
      <div className="relative w-full h-full">
        {isVideo(mediaUrls[currentIndex]) ? (
          <video
            src={mediaUrls[currentIndex]}
            controls
            className="w-full h-full object-cover"
            onError={() => console.error('Video failed to load')}
          />
        ) : (
          <img
            src={mediaUrls[currentIndex]}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => console.error('Image failed to load')}
          />
        )}

        {/* Remove button */}
        {editable && onRemove && (
          <button
            onClick={(e) => handleRemove(currentIndex, e)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Navigation arrows */}
        {mediaUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Media counter */}
        {mediaUrls.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
            {currentIndex + 1} / {mediaUrls.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2">
          <div className="flex space-x-2 overflow-x-auto">
            {mediaUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden ${
                  index === currentIndex ? 'ring-2 ring-white' : ''
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

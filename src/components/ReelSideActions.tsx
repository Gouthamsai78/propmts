
import { Heart, MessageCircle, Bookmark, Eye } from "lucide-react";

interface ReelSideActionsProps {
  isLiked: boolean;
  isSaved: boolean;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  handleLike: () => void;
  handleSave: () => void;
  handleComments: () => void;
}

export const ReelSideActions = ({
  isLiked,
  isSaved,
  likesCount,
  commentsCount,
  viewsCount,
  handleLike,
  handleSave,
  handleComments,
}: ReelSideActionsProps) => {
  return (
    <div className="absolute bottom-28 right-2 flex flex-col items-center space-y-5 z-30">
      <button onClick={handleLike} className="flex flex-col items-center space-y-1 text-center">
        <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full">
          <Heart className={`w-6 h-6 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </div>
        <span className="text-xs font-semibold">{likesCount?.toLocaleString()}</span>
      </button>
      <button onClick={handleComments} className="flex flex-col items-center space-y-1 text-center">
        <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full">
          <MessageCircle className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold">{commentsCount?.toLocaleString()}</span>
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
        <span className="text-xs font-semibold">{viewsCount?.toLocaleString() || 0}</span>
      </div>
    </div>
  );
};

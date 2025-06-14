
import { Film, Clock } from "lucide-react";

export const Reels = () => {
  return (
    <div className="max-w-md mx-auto px-4 space-y-8 py-12">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
          <Film className="w-12 h-12 text-purple-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Reels</h2>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Coming Soon</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="text-center text-gray-600">
          <p className="mb-4">A new and exciting way to discover prompts is on its way!</p>
          <p className="text-sm">Stay tuned for short, engaging video-style prompts.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-60">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-60">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

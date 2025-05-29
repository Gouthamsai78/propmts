
import { Users, Clock } from "lucide-react";

export const Communities = () => {
  return (
    <div className="max-w-md mx-auto px-4 space-y-8 py-12">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-12 h-12 text-purple-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Communities</h2>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Coming Soon</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="text-center text-gray-600">
          <p className="mb-4">We're building something amazing for our community!</p>
          <p className="text-sm">Connect with like-minded creators, share prompts, and collaborate on AI projects.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-60">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-60">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-60">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-4/5"></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-60">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};


import { useState } from "react";
import { Search as SearchIcon, Clock, Trending } from "lucide-react";

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches] = useState([
    "ChatGPT prompts",
    "Midjourney architecture",
    "Code review assistant",
    "Creative writing",
  ]);

  const [trendingTags] = useState([
    "chatgpt", "midjourney", "coding", "creative", "writing", 
    "productivity", "design", "photography", "business", "education"
  ]);

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      <div className="py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Search</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts, users, communities..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Recent Searches */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Recent</h3>
        </div>
        <div className="space-y-2">
          {recentSearches.map((search, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Tags */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-3">
          <Trending className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Trending</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag, index) => (
            <button
              key={index}
              className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 rounded-full text-sm font-medium hover:from-purple-100 hover:to-blue-100 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

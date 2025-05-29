
import { useState } from "react";
import { ExternalLink, Filter } from "lucide-react";

const mockTools = [
  {
    id: 1,
    name: "ChatGPT",
    description: "Advanced conversational AI for text generation and assistance",
    category: "Text Generation",
    url: "https://chat.openai.com",
    logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100"
  },
  {
    id: 2,
    name: "Midjourney",
    description: "AI-powered image generation from text prompts",
    category: "Image Generation",
    url: "https://midjourney.com",
    logo: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100"
  },
  {
    id: 3,
    name: "GitHub Copilot",
    description: "AI pair programmer for code suggestions and completion",
    category: "Code Generation",
    url: "https://github.com/features/copilot",
    logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100"
  },
  {
    id: 4,
    name: "DALL-E 3",
    description: "Create realistic images and art from text descriptions",
    category: "Image Generation",
    url: "https://openai.com/dall-e-3",
    logo: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=100"
  },
  {
    id: 5,
    name: "Claude",
    description: "AI assistant for analysis, writing, and complex reasoning",
    category: "Text Generation",
    url: "https://claude.ai",
    logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100"
  },
  {
    id: 6,
    name: "Runway ML",
    description: "AI-powered video editing and generation tools",
    category: "Video Generation",
    url: "https://runwayml.com",
    logo: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=100"
  }
];

const categories = ["All", "Text Generation", "Image Generation", "Code Generation", "Video Generation"];

export const Tools = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const filteredTools = selectedCategory === "All" 
    ? mockTools 
    : mockTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Tools</h2>
          <p className="text-gray-600">Discover useful AI applications</p>
        </div>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className="bg-gray-100 text-gray-700 p-3 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Category Filter */}
      {showFilter && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="space-y-3">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start space-x-4">
              <img
                src={tool.logo}
                alt={tool.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800 truncate">{tool.name}</h3>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{tool.description}</p>
                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  {tool.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

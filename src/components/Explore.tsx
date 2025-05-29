
import { useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const categories = [
  "All", "Text Generation", "Image Creation", "Code Assistant", 
  "Writing", "Productivity", "Design", "Video", "Audio", "Research"
];

const mockTools = [
  {
    id: 1,
    name: "ChatGPT",
    category: "Text Generation",
    description: "Advanced conversational AI for text generation and assistance",
    logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=80",
    url: "https://chat.openai.com",
    rating: 4.8,
    featured: true
  },
  {
    id: 2,
    name: "Midjourney",
    category: "Image Creation",
    description: "AI-powered image generation from text prompts",
    logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=80",
    url: "https://midjourney.com",
    rating: 4.7,
    featured: true
  },
  {
    id: 3,
    name: "GitHub Copilot",
    category: "Code Assistant",
    description: "AI pair programmer that helps you write code faster",
    logo: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=80",
    url: "https://github.com/features/copilot",
    rating: 4.6,
    featured: false
  },
  {
    id: 4,
    name: "Grammarly",
    category: "Writing",
    description: "AI writing assistant for grammar and style improvements",
    logo: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=80",
    url: "https://grammarly.com",
    rating: 4.5,
    featured: false
  }
];

export const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTools = selectedCategory === "All" 
    ? mockTools 
    : mockTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      <div className="py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Explore</h2>
        <p className="text-gray-600">Discover amazing AI tools</p>
      </div>

      {/* Category Carousel */}
      <div className="relative px-4">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {categories.map((category, index) => (
              <CarouselItem key={index} className="pl-2 basis-auto">
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>

      {/* Featured Tools */}
      {selectedCategory === "All" && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Featured Tools
          </h3>
          <div className="space-y-3">
            {mockTools.filter(tool => tool.featured).map((tool) => (
              <div key={tool.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <img src={tool.logo} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{tool.name}</h4>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {tool.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{tool.rating}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                  <ExternalLink className="w-5 h-5 text-purple-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tools */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">
          {selectedCategory === "All" ? "All Tools" : selectedCategory}
        </h3>
        <div className="space-y-3">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <img src={tool.logo} alt={tool.name} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{tool.name}</h4>
                <p className="text-sm text-gray-600">{tool.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {tool.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{tool.rating}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

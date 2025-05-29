
import { useState } from "react";
import { PromptCard } from "./PromptCard";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    title: "Perfect ChatGPT Prompt for Creative Writing",
    description: "This prompt helps generate engaging story ideas with rich character development and plot twists.",
    prompt: "You are a creative writing assistant. Generate a story idea with: 1) A compelling protagonist with a clear motivation, 2) An interesting conflict or challenge, 3) A unique setting, 4) A surprising plot twist. Make it engaging and original.",
    tags: ["chatgpt", "writing", "creative"],
    author: "Sarah Chen",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    likes: 234,
    comments: 18,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
    allowCopy: true,
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    title: "Midjourney Architecture Prompt",
    description: "Create stunning architectural visualizations with this detailed prompt structure.",
    prompt: "architectural visualization of a modern sustainable house, glass walls, wooden accents, surrounded by forest, golden hour lighting, hyper-realistic, 8k resolution --ar 16:9 --v 5",
    tags: ["midjourney", "architecture", "design"],
    author: "Alex Rodriguez",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    likes: 189,
    comments: 12,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    allowCopy: true,
    timestamp: "4 hours ago"
  },
  {
    id: 3,
    title: "Code Review Assistant Prompt",
    description: "Get detailed code reviews and improvement suggestions from AI.",
    prompt: "Act as a senior software engineer conducting a code review. Analyze the provided code for: 1) Code quality and best practices, 2) Potential bugs or security issues, 3) Performance optimizations, 4) Readability improvements. Provide specific, actionable feedback.",
    tags: ["coding", "review", "development"],
    author: "Mike Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    likes: 156,
    comments: 23,
    allowCopy: true,
    timestamp: "6 hours ago"
  }
];

export const Feed = () => {
  const [posts] = useState(mockPosts);
  const { toast } = useToast();

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied!",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  const handleLike = (postId: number) => {
    toast({
      title: "Liked!",
      description: "Post added to your likes.",
    });
  };

  const handleSave = (postId: number) => {
    toast({
      title: "Saved!",
      description: "Post saved to your collection.",
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Discover Prompts</h2>
        <p className="text-gray-600">Fuel your AI journey</p>
      </div>
      
      {posts.map((post) => (
        <PromptCard
          key={post.id}
          post={post}
          onCopyPrompt={() => handleCopyPrompt(post.prompt)}
          onLike={() => handleLike(post.id)}
          onSave={() => handleSave(post.id)}
        />
      ))}
    </div>
  );
};

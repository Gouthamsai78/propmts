
import { useState } from "react";
import { Camera, X, Upload, Image, Video } from "lucide-react";
import { useCreatePost } from "@/hooks/usePosts";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MediaCarousel } from "./MediaCarousel";

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [allowCopy, setAllowCopy] = useState(true);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const createPostMutation = useCreatePost();
  const { uploadMultipleFiles, uploading } = useFileUpload();

  const categories = [
    "chatgpt",
    "midjourney",
    "coding", 
    "creative",
    "writing",
    "productivity",
    "design",
    "photography",
    "business",
    "education"
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total file count
    if (mediaUrls.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 media files per post.",
        variant: "destructive",
      });
      return;
    }

    // Check file sizes and types
    const invalidFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) return true; // 50MB limit
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/mov', 'video/avi', 'video/webm'
      ];
      return !allowedTypes.includes(file.type);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files",
        description: "Please select images (JPEG, PNG, GIF, WebP) or videos (MP4, MOV, AVI, WebM) under 50MB each.",
        variant: "destructive",
      });
      return;
    }

    try {
      const urls = await uploadMultipleFiles(files);
      setMediaUrls(prev => [...prev, ...urls]);
      toast({
        title: "Files uploaded!",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createPostMutation.mutateAsync({
        title: title.trim(),
        content: content.trim() || null,
        prompt: prompt.trim() || null,
        category: category || null,
        allow_copy: allowCopy,
        image_url: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
      });

      // Reset form
      setTitle("");
      setContent("");
      setPrompt("");
      setCategory("");
      setAllowCopy(true);
      setMediaUrls([]);

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });
    } catch (error) {
      console.error('Create post error:', error);
      toast({
        title: "Error",
        description: "Unable to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Post</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your post..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              AI Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your AI prompt here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Upload ({mediaUrls.length}/5)
            </label>
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading || mediaUrls.length >= 5}
                multiple
              />
              <div className="flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {mediaUrls.length >= 5 ? 'Max files reached' : 'Upload Images/Videos'}
                    </span>
                  </div>
                )}
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Supports: JPEG, PNG, GIF, WebP, MP4, MOV, AVI, WebM (max 50MB each, 5 files total)
            </p>
          </div>

          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div>
              <MediaCarousel 
                mediaUrls={mediaUrls} 
                onRemove={handleRemoveMedia}
                editable={true}
              />
            </div>
          )}

          {/* Allow Copy */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowCopy"
              checked={allowCopy}
              onChange={(e) => setAllowCopy(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="allowCopy" className="text-sm text-gray-700">
              Allow others to copy this prompt
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || uploading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? "Creating..." : uploading ? "Uploading..." : "Share Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

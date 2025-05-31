
import { useState } from "react";
import { Camera, X, Upload, Image, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { useCreatePost } from "@/hooks/usePosts";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [allowCopy, setAllowCopy] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const createPostMutation = useCreatePost();
  const { uploadFile, uploading } = useFileUpload();

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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `File ${file.name} is larger than 10MB and was skipped.`,
          variant: "destructive",
        });
        continue;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `File ${file.name} is not a supported format and was skipped.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const url = await uploadFile(file);
        if (url) {
          setImageUrls(prev => [...prev, url]);
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    }

    if (files.length > 0) {
      toast({
        title: "Files uploaded!",
        description: `Successfully uploaded ${files.length} file(s).`,
      });
    }
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
        image_url: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      });

      // Reset form
      setTitle("");
      setContent("");
      setPrompt("");
      setCategory("");
      setAllowCopy(true);
      setImageUrls([]);
      setCurrentImageIndex(0);

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

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= imageUrls.length - 1) {
      setCurrentImageIndex(Math.max(0, imageUrls.length - 2));
    }
  };

  const nextImage = () => {
    if (imageUrls.length > 1 && currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 1 && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const isVideo = (url: string) => url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi'));

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
              Media Upload
            </label>
            <div className="flex space-x-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
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
                      <span className="text-sm text-gray-600">Upload Images/Videos</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supports: JPEG, PNG, GIF, WebP, MP4, MOV, AVI (max 10MB)
            </p>
          </div>

          {/* Image/Video Carousel */}
          {imageUrls.length > 0 && (
            <div className="relative">
              {isVideo(imageUrls[currentImageIndex]) ? (
                <video
                  src={imageUrls[currentImageIndex]}
                  controls
                  className="w-full h-48 object-cover rounded-lg"
                  onError={() => removeImage(currentImageIndex)}
                />
              ) : (
                <img
                  src={imageUrls[currentImageIndex]}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={() => removeImage(currentImageIndex)}
                />
              )}
              
              {/* Navigation arrows */}
              {imageUrls.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className={`bg-black bg-opacity-50 text-white p-1 rounded-full ${currentImageIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-70'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    disabled={currentImageIndex === imageUrls.length - 1}
                    className={`bg-black bg-opacity-50 text-white p-1 rounded-full ${currentImageIndex === imageUrls.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-70'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(currentImageIndex)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Image counter */}
              {imageUrls.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} / {imageUrls.length}
                  </div>
                </div>
              )}
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

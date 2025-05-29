
import { useState } from "react";
import { Camera, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreatePost } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState("");
  const [allowCopy, setAllowCopy] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const createPostMutation = useCreatePost();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        title: title.trim(),
        content: description.trim(),
        prompt: prompt.trim() || null,
        category: tags.trim() || null,
        allow_copy: allowCopy,
        image_url: selectedImage || null,
      });

      toast({
        title: "Post created!",
        description: "Your prompt has been shared with the community.",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setPrompt("");
      setTags("");
      setSelectedImage(null);
      setAllowCopy(true);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Failed to create post",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
        <p className="text-gray-600">Please sign in to create and share prompts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      <div className="py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Post</h2>
        <p className="text-gray-600">Share your amazing prompts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Media (Optional)</label>
          {selectedImage ? (
            <div className="relative">
              <img src={selectedImage} alt="Upload preview" className="w-full h-48 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload image or video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your prompt a catchy title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what your prompt does and how to use it..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Prompt */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your AI prompt here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Category/Tags</label>
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="chatgpt, creative, writing"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
        </div>

        {/* Allow Copy Toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow prompt copying</label>
              <p className="text-xs text-gray-500">Let others copy your prompt easily</p>
            </div>
            <button
              type="button"
              onClick={() => setAllowCopy(!allowCopy)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                allowCopy ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  allowCopy ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createPostMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createPostMutation.isPending ? 'Creating...' : 'Share Prompt'}
        </button>
      </form>
    </div>
  );
};

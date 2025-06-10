
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Video, X, FileText, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreatePost } from "@/hooks/usePosts";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [allowCopy, setAllowCopy] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<"prompt" | "tool">("prompt");
  
  // Tool-specific fields
  const [toolUrl, setToolUrl] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  
  const { uploadMultipleFiles, uploading: uploadingFiles } = useFileUpload();
  const createPostMutation = useCreatePost();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Only images and videos are allowed.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "File size must be less than 50MB.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post.",
        variant: "destructive",
      });
      return;
    }

    if (postType === "prompt" && !prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for your post.",
        variant: "destructive",
      });
      return;
    }

    if (postType === "tool" && !toolUrl.trim()) {
      toast({
        title: "Tool URL required",
        description: "Please enter a URL for the AI tool.",
        variant: "destructive",
      });
      return;
    }

    try {
      let mediaUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadMultipleFiles(selectedFiles);
      }

      let postData;
      
      if (postType === "prompt") {
        postData = {
          title,
          content,
          prompt,
          category,
          allow_copy: allowCopy,
          image_url: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
        };
      } else {
        postData = {
          title,
          content: toolDescription,
          prompt: toolUrl, // Store tool URL in prompt field for now
          category: `tool,${category}`,
          allow_copy: false, // Tools don't need copy functionality
          image_url: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
        };
      }

      await createPostMutation.mutateAsync(postData);
      
      toast({
        title: "Success!",
        description: `Your ${postType} post has been created.`,
      });

      // Reset form
      setTitle("");
      setContent("");
      setPrompt("");
      setCategory("");
      setAllowCopy(true);
      setSelectedFiles([]);
      setToolUrl("");
      setToolDescription("");
      
      // Navigate back to home
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createPostMutation.isPending || uploadingFiles;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Post</h2>
        
        <Tabs value={postType} onValueChange={(value) => setPostType(value as "prompt" | "tool")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Prompt Post
            </TabsTrigger>
            <TabsTrigger value="tool" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              AI Tool Post
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={postType === "prompt" ? "Enter your prompt title..." : "Enter the AI tool name..."}
                className="mt-1"
                required
              />
            </div>

            <TabsContent value="prompt" className="space-y-6 mt-0">
              <div>
                <Label htmlFor="prompt">Prompt *</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your AI prompt here..."
                  className="mt-1 min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Description (Optional)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe how to use this prompt or what it's for..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowCopy"
                  checked={allowCopy}
                  onChange={(e) => setAllowCopy(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="allowCopy" className="text-sm">
                  Allow others to copy this prompt
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="tool" className="space-y-6 mt-0">
              <div>
                <Label htmlFor="toolUrl">Tool URL *</Label>
                <Input
                  id="toolUrl"
                  type="url"
                  value={toolUrl}
                  onChange={(e) => setToolUrl(e.target.value)}
                  placeholder="https://example.com/ai-tool"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="toolDescription">Description *</Label>
                <Textarea
                  id="toolDescription"
                  value={toolDescription}
                  onChange={(e) => setToolDescription(e.target.value)}
                  placeholder="Describe what this AI tool does and how it can be useful..."
                  className="mt-1 min-h-[120px]"
                  required
                />
              </div>
            </TabsContent>

            <div>
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={postType === "prompt" ? "e.g., chatgpt, midjourney, coding" : "e.g., text generation, image creation, productivity"}
                className="mt-1"
              />
            </div>

            {/* Media Upload */}
            <div>
              <Label>Media (Optional)</Label>
              <div className="mt-2 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('media-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Add Images
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('media-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Add Videos
                  </Button>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Video className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : `Create ${postType === "prompt" ? "Prompt" : "Tool"} Post`}
            </Button>
          </form>
        </Tabs>
      </div>
    </div>
  );
};

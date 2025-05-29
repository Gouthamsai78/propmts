
import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Comments = ({ postId, isOpen, onClose }: CommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const { data: comments, isLoading } = useComments(postId);
  const createCommentMutation = useCreateComment();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to comment on posts.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        postId,
        content: newComment.trim(),
      });
      setNewComment("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to post comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end">
      <div className="bg-white rounded-t-2xl w-full max-w-md h-2/3 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading comments...</div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <img
                  src={(comment.users as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(comment.users as any)?.username || 'anonymous'}`}
                  alt={(comment.users as any)?.username || 'Anonymous'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="font-medium text-sm text-gray-800">
                      {(comment.users as any)?.display_name || (comment.users as any)?.username || 'Anonymous'}
                    </p>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitComment} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={createCommentMutation.isPending}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

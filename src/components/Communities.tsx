
import { useState } from "react";
import { Users, Plus, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCommunities, useJoinCommunity, useLeaveCommunity } from "@/hooks/useCommunities";
import { useAuth } from "@/contexts/AuthContext";

export const Communities = () => {
  const { data: communities, isLoading } = useCommunities();
  const { user } = useAuth();
  const { toast } = useToast();
  const joinCommunityMutation = useJoinCommunity();
  const leaveCommunityMutation = useLeaveCommunity();

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to join communities.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user is already a member
      const community = communities?.find(c => c.id === communityId);
      const isAlreadyMember = community?.community_members?.some(m => m.user_id === user.id);

      if (isAlreadyMember) {
        await leaveCommunityMutation.mutateAsync(communityId);
        toast({
          title: "Left community",
          description: `You left ${community?.name}`,
        });
      } else {
        await joinCommunityMutation.mutateAsync(communityId);
        toast({
          title: "Joined community!",
          description: `Welcome to ${community?.name}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Communities</h2>
            <p className="text-gray-600">Connect with like-minded creators</p>
          </div>
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Communities</h2>
          <p className="text-gray-600">Connect with like-minded creators</p>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {communities?.map((community) => {
          const isJoined = user ? community.community_members?.some(m => m.user_id === user.id) : false;
          const isAdmin = user ? community.community_members?.some(m => m.user_id === user.id && m.role === 'admin') : false;

          return (
            <div key={community.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-32">
                <img
                  src={community.cover_image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400"}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-lg">{community.name}</h3>
                    {isAdmin && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm opacity-90">
                    <Users className="w-4 h-4" />
                    <span>{community.member_count || 0} members</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 mb-4">{community.description}</p>
                
                <button
                  onClick={() => handleJoinCommunity(community.id)}
                  disabled={joinCommunityMutation.isPending || leaveCommunityMutation.isPending}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 ${
                    isJoined
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                  }`}
                >
                  {isJoined ? 'Joined' : 'Join Community'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

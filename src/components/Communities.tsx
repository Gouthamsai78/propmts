
import { useState } from "react";
import { Users, Plus, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCommunities = [
  {
    id: 1,
    name: "ChatGPT Masters",
    description: "Advanced prompting techniques for ChatGPT",
    memberCount: 15240,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    isJoined: true,
    isAdmin: false
  },
  {
    id: 2,
    name: "Midjourney Artists",
    description: "Creative AI art and prompt sharing",
    memberCount: 23100,
    coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
    isJoined: false,
    isAdmin: false
  },
  {
    id: 3,
    name: "AI Writing Hub",
    description: "Content creation with AI assistance",
    memberCount: 8750,
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
    isJoined: true,
    isAdmin: true
  },
  {
    id: 4,
    name: "Code Prompters",
    description: "Programming with AI assistance",
    memberCount: 12500,
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    isJoined: false,
    isAdmin: false
  }
];

export const Communities = () => {
  const [communities, setCommunities] = useState(mockCommunities);
  const { toast } = useToast();

  const handleJoinCommunity = (communityId: number) => {
    setCommunities(prev => 
      prev.map(community => 
        community.id === communityId 
          ? { ...community, isJoined: !community.isJoined, memberCount: community.isJoined ? community.memberCount - 1 : community.memberCount + 1 }
          : community
      )
    );
    
    const community = communities.find(c => c.id === communityId);
    if (community) {
      toast({
        title: community.isJoined ? "Left community" : "Joined community!",
        description: community.isJoined ? `You left ${community.name}` : `Welcome to ${community.name}!`,
      });
    }
  };

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
        {communities.map((community) => (
          <div key={community.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative h-32">
              <img
                src={community.coverImage}
                alt={community.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-lg">{community.name}</h3>
                  {community.isAdmin && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-1 text-sm opacity-90">
                  <Users className="w-4 h-4" />
                  <span>{community.memberCount.toLocaleString()} members</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">{community.description}</p>
              
              <button
                onClick={() => handleJoinCommunity(community.id)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  community.isJoined
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                }`}
              >
                {community.isJoined ? 'Joined' : 'Join Community'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

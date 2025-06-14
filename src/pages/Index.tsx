
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Feed } from "@/components/Feed";
import { Reels } from "@/components/Reels";
import { Explore } from "@/components/Explore";
import { CreatePost } from "@/components/CreatePost";
import { Profile } from "@/components/Profile";
import { Search } from "@/components/Search";
import { Header } from "@/components/Header";

type ActiveTab = 'home' | 'reels' | 'search' | 'explore' | 'create' | 'profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewingUserId, setViewingUserId] = useState<string | undefined>();

  const handleProfileClick = () => {
    setViewingUserId(undefined);
    setActiveTab('profile');
  };

  const handleUserClick = (userId: string) => {
    setViewingUserId(userId);
    setActiveTab('profile');
  };

  const handleSearchClick = () => {
    setActiveTab('search');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Feed onUserClick={handleUserClick} />;
      case 'reels':
        return <Reels />;
      case 'search':
        return <Search onUserClick={handleUserClick} />;
      case 'explore':
        return <Explore onUserClick={handleUserClick} />;
      case 'create':
        return <CreatePost />;
      case 'profile':
        return <Profile userId={viewingUserId} onUserClick={handleUserClick} />;
      default:
        return <Feed onUserClick={handleUserClick} />;
    }
  };

  const isReelsPage = activeTab === 'reels';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {!isReelsPage && (
        <Header 
          onProfileClick={handleProfileClick} 
          onSearchClick={handleSearchClick}
        />
      )}
      <main className={isReelsPage ? "h-screen bg-black" : "pb-20 pt-16"}>
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} isReelsPage={isReelsPage} />
    </div>
  );
};

export default Index;

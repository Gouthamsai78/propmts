
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Feed } from "@/components/Feed";
import { Communities } from "@/components/Communities";
import { Explore } from "@/components/Explore";
import { CreatePost } from "@/components/CreatePost";
import { Profile } from "@/components/Profile";
import { Search } from "@/components/Search";
import { Header } from "@/components/Header";

type ActiveTab = 'home' | 'communities' | 'search' | 'explore' | 'create' | 'profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewingUserId, setViewingUserId] = useState<string | undefined>();

  console.log('Index component rendered, activeTab:', activeTab);

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
    console.log('Rendering content for activeTab:', activeTab);
    switch (activeTab) {
      case 'home':
        console.log('Rendering Feed component');
        return <Feed onUserClick={handleUserClick} />;
      case 'communities':
        console.log('Rendering Communities component');
        return <Communities />;
      case 'search':
        console.log('Rendering Search component');
        return <Search onUserClick={handleUserClick} />;
      case 'explore':
        console.log('Rendering Explore component');
        return <Explore onUserClick={handleUserClick} />;
      case 'create':
        console.log('Rendering CreatePost component');
        return <CreatePost />;
      case 'profile':
        console.log('Rendering Profile component');
        return <Profile userId={viewingUserId} onUserClick={handleUserClick} />;
      default:
        console.log('Rendering default Feed component');
        return <Feed onUserClick={handleUserClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header 
        onProfileClick={handleProfileClick} 
        onSearchClick={handleSearchClick}
      />
      <main className="pb-20 pt-16">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

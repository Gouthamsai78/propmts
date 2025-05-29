
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Feed />;
      case 'communities':
        return <Communities />;
      case 'search':
        return <Search />;
      case 'explore':
        return <Explore />;
      case 'create':
        return <CreatePost />;
      case 'profile':
        return <Profile />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />
      <main className="pb-20 pt-16">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

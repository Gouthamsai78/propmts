
import { Home, Search, Compass, Plus, Film } from "lucide-react";

type Tab = 'home' | 'reels' | 'search' | 'explore' | 'create' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isReelsPage?: boolean;
}

export const BottomNav = ({ activeTab, onTabChange, isReelsPage = false }: BottomNavProps) => {
  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'reels' as Tab, icon: Film, label: 'Reels' },
    { id: 'search' as Tab, icon: Search, label: 'Search' },
    { id: 'explore' as Tab, icon: Compass, label: 'Explore' },
    { id: 'create' as Tab, icon: Plus, label: 'Create' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 border-t z-10 overflow-x-auto ${
      isReelsPage
        ? 'bg-black/30 backdrop-blur-lg border-t-white/10'
        : 'bg-white/90 backdrop-blur-lg border-gray-200/50'
    }`}>
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon as any;
            
            const inactiveClasses = isReelsPage
              ? 'text-gray-300 hover:text-white hover:bg-white/10'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100';

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : inactiveClasses
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs font-medium`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

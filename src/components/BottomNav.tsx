
import { Home, Search, Compass, Plus } from "lucide-react";

type Tab = 'home' | 'communities' | 'search' | 'explore' | 'create' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'communities' as Tab, icon: 'coming-soon', label: 'Communities' },
    { id: 'search' as Tab, icon: Search, label: 'Search' },
    { id: 'explore' as Tab, icon: Compass, label: 'Explore' },
    { id: 'create' as Tab, icon: Plus, label: 'Create' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 overflow-x-auto">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            // Special handling for communities tab
            if (tab.id === 'communities') {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-200 text-gray-400 cursor-not-allowed"
                >
                  <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                  <span className="text-xs font-medium">Soon</span>
                </button>
              );
            }
            
            const Icon = tab.icon as any;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
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


import { Home, Users, Search, Plus, User } from "lucide-react";

type Tab = 'home' | 'communities' | 'tools' | 'create' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'communities' as Tab, icon: Users, label: 'Communities' },
    { id: 'tools' as Tab, icon: Search, label: 'Tools' },
    { id: 'create' as Tab, icon: Plus, label: 'Create' },
    { id: 'profile' as Tab, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
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

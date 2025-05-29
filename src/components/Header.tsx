
import { Search, Bell, MessageSquare } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onProfileClick: () => void;
  onSearchClick?: () => void;
}

export const Header = ({ onProfileClick, onSearchClick }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PromptShare
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            {user && (
              <>
                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </>
            )}
            
            <UserMenu onProfileClick={onProfileClick} />
          </div>
        </div>
      </div>
    </header>
  );
};

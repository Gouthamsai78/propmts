
import { Bell, Search, User } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onProfileClick?: () => void;
}

export const Header = ({ onProfileClick }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          PromptShare
        </h1>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          {user ? (
            <button 
              onClick={onProfileClick}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <UserMenu />
          )}
        </div>
      </div>
    </header>
  );
};

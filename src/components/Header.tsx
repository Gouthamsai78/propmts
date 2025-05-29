
import { Search, Bell } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Promptly
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { TrendingUp, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from './auth/AuthProvider';
import { Switch } from './ui/switch';
import toast from 'react-hot-toast';

interface HeaderProps {
  user: any;
  onAuthRequired: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onAuthRequired
}) => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully! 👋');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="relative z-50">
      <div className="glass-card dark:glass-card-dark border-0 border-b border-white/20 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 mr-3 glow-blue">
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text dark:gradient-text-dark">
                ExpenseFlow
              </span>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3">
              {/* User Info */}
              {user ? (
                <div className="flex items-center space-x-2 glass-card dark:glass-card-dark px-3 py-2 rounded-full">
                  <div className="bg-green-500 rounded-full p-1">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm text-white/80 hidden sm:block">
                    {user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={14} className="text-white/70" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuthRequired}
                  className="glass-card dark:glass-card-dark px-4 py-2 rounded-full text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Theme Toggle */}
              <div className="flex items-center space-x-2 glass-card dark:glass-card-dark px-3 py-2 rounded-full">
                <Sun size={16} className="text-yellow-500" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-yellow-200"
                />
                <Moon size={16} className="text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { TrendingUp, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

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

            {/* Theme Toggle */}
            <div className="flex items-center space-x-3">
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
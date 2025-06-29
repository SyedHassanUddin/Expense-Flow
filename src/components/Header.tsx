import React from 'react';
import { TrendingUp, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from './auth/AuthProvider';
import { Switch } from './ui/switch';
import SettingsDropdown from './SettingsDropdown';
import { Currency, TimeFilter } from '../types/expense';
import toast from 'react-hot-toast';

interface HeaderProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onExport: () => void;
  onClearAll: () => void;
  expenseCount: number;
  user: any;
  onAuthRequired: () => void;
}

const Header: React.FC<HeaderProps> = ({
  timeFilter,
  onTimeFilterChange,
  currency,
  onCurrencyChange,
  onExport,
  onClearAll,
  expenseCount,
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

  const currencies: Currency[] = ['₹', '$', '€', '£'];

  return (
    <header className="relative z-50 bg-white/80 backdrop-blur-md border-b-2 border-pink-100">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mr-3 soft-hover">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-emerald-600">Expense</span>
              <span className="text-amber-500">Flow</span>
            </span>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Currency Switcher */}
            <div className="flex items-center space-x-1 bg-white rounded-full p-1 border-2 border-emerald-200 shadow-lg">
              {currencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={`currency-pill text-sm ${
                    currency === curr ? 'active' : ''
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* User Info */}
            {user ? (
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 border-2 border-green-200 shadow-lg">
                <div className="bg-green-500 rounded-full p-1">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium hidden sm:block">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  title="Sign out"
                >
                  <LogOut size={14} className="text-red-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthRequired}
                className="bg-white px-4 py-2 rounded-full text-sm text-gray-700 font-medium border-2 border-blue-200 hover:bg-blue-50 transition-colors shadow-lg"
              >
                Sign In
              </button>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 border-2 border-yellow-200 shadow-lg">
              <Sun size={16} className="text-yellow-500" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-yellow-200"
              />
              <Moon size={16} className="text-slate-700 dark:text-slate-300" />
            </div>

            {/* Settings Dropdown */}
            <SettingsDropdown
              timeFilter={timeFilter}
              onTimeFilterChange={onTimeFilterChange}
              currency={currency}
              onCurrencyChange={onCurrencyChange}
              onExport={onExport}
              onClearAll={onClearAll}
              expenseCount={expenseCount}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
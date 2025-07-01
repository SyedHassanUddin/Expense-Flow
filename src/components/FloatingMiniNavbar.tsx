import React, { useState, useRef, useEffect } from 'react';
import { Settings, Filter, DollarSign, Download, Trash, X } from 'lucide-react';
import { Currency, TimeFilter } from '../types/expense';

interface FloatingMiniNavbarProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onExport: () => void;
  onClearAll: () => void;
  expenseCount: number;
}

const FloatingMiniNavbar: React.FC<FloatingMiniNavbarProps> = ({
  timeFilter,
  onTimeFilterChange,
  currency,
  onCurrencyChange,
  onExport,
  onClearAll,
  expenseCount
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const currencies: Currency[] = ['₹', '$', '€', '£'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center space-x-3" ref={dropdownRef}>
      {/* Time Filter Button */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('timeFilter')}
          className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white group"
          title="Time Filter"
        >
          <Filter size={20} className={`transition-transform duration-300 ${activeDropdown === 'timeFilter' ? 'rotate-180' : ''}`} />
        </button>

        {activeDropdown === 'timeFilter' && (
          <div className="absolute bottom-full left-0 mb-2 w-32 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-600 mb-2 px-2">Time Filter</div>
              {timeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    onTimeFilterChange(filter.value);
                    setActiveDropdown(null);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    timeFilter === filter.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Currency Button */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('currency')}
          className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white group"
          title="Currency"
        >
          <DollarSign size={20} className={`transition-transform duration-300 ${activeDropdown === 'currency' ? 'rotate-180' : ''}`} />
        </button>

        {activeDropdown === 'currency' && (
          <div className="absolute bottom-full left-0 mb-2 w-24 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-600 mb-2 px-2">Currency</div>
              <div className="grid grid-cols-2 gap-1">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      onCurrencyChange(curr);
                      setActiveDropdown(null);
                    }}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currency === curr
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Button */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('settings')}
          className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white group"
          title="Settings"
        >
          <Settings size={20} className={`transition-transform duration-300 ${activeDropdown === 'settings' ? 'rotate-90' : ''}`} />
        </button>

        {activeDropdown === 'settings' && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-800 text-sm">Settings</h3>
              <button
                onClick={() => setActiveDropdown(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-3 space-y-2">
              <button
                onClick={() => {
                  onExport();
                  setActiveDropdown(null);
                }}
                disabled={expenseCount === 0}
                className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm"
              >
                <Download size={14} className="mr-2" />
                Export CSV
              </button>

              <button
                onClick={() => {
                  onClearAll();
                  setActiveDropdown(null);
                }}
                disabled={expenseCount === 0}
                className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm"
              >
                <Trash size={14} className="mr-2" />
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingMiniNavbar;
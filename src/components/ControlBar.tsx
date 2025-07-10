import React, { useState, useRef, useEffect } from 'react';
import { Filter, DollarSign, ChevronDown } from 'lucide-react';
import { Currency, TimeFilter } from '../types/expense';

interface ControlBarProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  timeFilter,
  onTimeFilterChange,
  currency,
  onCurrencyChange
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

  const getCurrentTimeFilterLabel = () => {
    return timeFilters.find(f => f.value === timeFilter)?.label || 'All Time';
  };

  return (
    <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/20 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-4" ref={dropdownRef}>
          {/* Time Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('timeFilter')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white"
            >
              <Filter size={16} />
              <span className="text-sm font-medium">{getCurrentTimeFilterLabel()}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === 'timeFilter' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'timeFilter' && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-32 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2">
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

          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('currency')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white"
            >
              <DollarSign size={16} />
              <span className="text-sm font-medium">{currency}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === 'currency' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'currency' && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {currencies.map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          onCurrencyChange(curr);
                          setActiveDropdown(null);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center ${
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
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
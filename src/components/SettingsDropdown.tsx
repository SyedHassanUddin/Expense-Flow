import React, { useState, useRef, useEffect } from 'react';
import { Settings, Download, Trash, DollarSign, Filter, X } from 'lucide-react';
import { Currency, TimeFilter } from '../types/expense';

interface SettingsDropdownProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onExport: () => void;
  onClearAll: () => void;
  expenseCount: number;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  timeFilter,
  onTimeFilterChange,
  currency,
  onCurrencyChange,
  onExport,
  onClearAll,
  expenseCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
        aria-label="Settings"
      >
        <Settings size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <h3 className="font-semibold text-gray-800">Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Time Filter */}
            <div>
              <div className="flex items-center mb-3">
                <Filter size={16} className="text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700">Time Filter</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => onTimeFilterChange(filter.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeFilter === filter.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <div className="flex items-center mb-3">
                <DollarSign size={16} className="text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700">Currency</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => onCurrencyChange(curr)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currency === curr
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onExport();
                  setIsOpen(false);
                }}
                disabled={expenseCount === 0}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </button>

              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                disabled={expenseCount === 0}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Trash size={16} className="mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
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
        className="w-12 h-12 bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-colors shadow-lg flex items-center justify-center soft-hover"
        aria-label="Settings"
      >
        <Settings size={20} className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-3xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-pink-50 to-blue-50">
            <h3 className="font-bold text-gray-800 text-lg">Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Time Filter */}
            <div>
              <div className="flex items-center mb-4">
                <Filter size={16} className="text-blue-500 mr-2" />
                <label className="text-sm font-bold text-gray-700">Time Filter</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => onTimeFilterChange(filter.value)}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      timeFilter === filter.value
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <div className="flex items-center mb-4">
                <DollarSign size={16} className="text-green-500 mr-2" />
                <label className="text-sm font-bold text-gray-700">Currency</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => onCurrencyChange(curr)}
                    className={`px-3 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      currency === curr
                        ? 'bg-green-500 text-white shadow-lg transform scale-105'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onExport();
                  setIsOpen(false);
                }}
                disabled={expenseCount === 0}
                className="w-full csv-button button-glow micro-bounce disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export CSV
              </button>

              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                disabled={expenseCount === 0}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105"
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
import React from 'react';
import { Search, Filter, Download, Trash } from 'lucide-react';
import { Currency, TimeFilter } from '../types/expense';

interface FiltersProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onExport: () => void;
  onClearAll: () => void;
  expenseCount: number;
}

const Filters: React.FC<FiltersProps> = ({
  timeFilter,
  onTimeFilterChange,
  currency,
  onCurrencyChange,
  searchTerm,
  onSearchChange,
  onExport,
  onClearAll,
  expenseCount
}) => {
  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const currencies: Currency[] = ['₹', '$', '€', '£'];

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Time Filters */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <div className="flex bg-gray-100 rounded-xl p-1">
              {timeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onTimeFilterChange(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    timeFilter === filter.value
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search expenses..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Currency and Actions */}
          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={onExport}
              disabled={expenseCount === 0}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>

            {/* Clear All Button */}
            <button
              onClick={onClearAll}
              disabled={expenseCount === 0}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
            >
              <Trash size={16} className="mr-2" />
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
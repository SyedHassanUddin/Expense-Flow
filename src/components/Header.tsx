import React from 'react';
import { Search, Menu, Sun, Calendar } from 'lucide-react';
import { Currency, TimeFilter } from '../types/expense';

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
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  timeFilter,
  onTimeFilterChange,
  currency,
  onCurrencyChange,
  onMenuClick
}) => {
  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'all', label: 'All' }
  ];

  const currencies: Currency[] = ['₹', '$', '€', '£'];

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="app-header">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg mr-3"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome back <span className="text-blue-500">Mathew</span>!
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          {/* Date */}
          <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
            <Calendar size={16} className="mr-2" />
            {getCurrentDate()}
          </div>
        </div>
      </div>

      {/* Weather and Filters */}
      <div className="flex items-center justify-between">
        {/* Weather Widget */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl">
            <Sun size={24} className="text-yellow-300" />
            <div>
              <div className="text-lg font-bold">26°C</div>
              <div className="text-xs opacity-90">It's a Sunny Day today!</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Don't forget to track your expenses today.
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          {/* Time Filter */}
          <div className="time-filter">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onTimeFilterChange(filter.value)}
                className={`time-option ${timeFilter === filter.value ? 'active' : ''}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Currency Switcher */}
          <div className="currency-switcher">
            {currencies.map((curr) => (
              <button
                key={curr}
                onClick={() => onCurrencyChange(curr)}
                className={`currency-option ${currency === curr ? 'active' : ''}`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
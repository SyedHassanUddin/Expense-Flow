import React from 'react';
import { TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp size={24} className="text-blue-500 mr-2" />
            <span className="text-xl font-bold text-gray-800">ExpenseFlow</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
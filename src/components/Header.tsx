import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp size={24} className="text-blue-500 mr-2" />
            <span className="text-xl font-bold text-gray-800">ExpenseFlow</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Subscription Button */}
            <button
              onClick={() => navigate('/subscription')}
              className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg"
            >
              <CreditCard size={16} className="mr-2" />
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
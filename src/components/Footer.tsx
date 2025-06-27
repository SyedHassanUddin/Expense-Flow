import React from 'react';
import { Heart, TrendingUp } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp size={24} className="text-blue-500 mr-2" />
          <span className="text-xl font-bold text-gray-800">ExpenseFlow</span>
        </div>
        
        <p className="text-gray-600 mb-4">
          Smart expense tracking made simple and beautiful
        </p>
        
        <div className="flex items-center justify-center text-sm text-gray-500">
          <span>Made with</span>
          <Heart size={16} className="mx-2 text-red-500" />
          <span>for better financial tracking</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            © 2024 ExpenseFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
  showAnimation?: boolean;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick, showAnimation = false }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 left-8 z-40 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:from-purple-600 hover:to-purple-700 hover:scale-105 transition-all duration-150 group ${
        showAnimation ? 'animate-bounce' : ''
      }`}
      aria-label="Add new expense"
    >
      <div className="flex items-center space-x-2">
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-150" />
        <span className="font-medium text-sm">Add Expense</span>
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-2xl bg-purple-400 opacity-0 group-hover:opacity-20 group-hover:scale-110 transition-all duration-150"></div>
      
      {/* Enhanced tooltip for new users */}
      <div className={`absolute bottom-full left-0 mb-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg transition-all duration-150 whitespace-nowrap ${
        showAnimation ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
      }`}>
        {showAnimation ? (
          <div className="text-center">
            <div className="font-semibold text-blue-300">👋 Start Here!</div>
            <div>Click to track your first expense</div>
          </div>
        ) : (
          'Quick Add Expense'
        )}
        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
      
      {/* Pulsing ring animation for new users */}
      {showAnimation && (
        <>
          <div className="absolute inset-0 rounded-2xl border-4 border-purple-300 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 animate-pulse"></div>
        </>
      )}
    </button>
  );
};

export default FloatingAddButton;
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
      className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-blue-700 hover:scale-110 transition-all duration-300 group ${
        showAnimation ? 'animate-bounce' : ''
      }`}
      aria-label="Add new expense"
    >
      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
      
      {/* Enhanced tooltip for new users */}
      <div className={`absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg transition-all duration-300 whitespace-nowrap ${
        showAnimation ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
      }`}>
        {showAnimation ? (
          <div className="text-center">
            <div className="font-semibold text-blue-300">👋 Start Here!</div>
            <div>Click to add your first expense</div>
          </div>
        ) : (
          'Add Expense'
        )}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
      
      {/* Pulsing ring animation for new users */}
      {showAnimation && (
        <>
          <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse"></div>
        </>
      )}
    </button>
  );
};

export default FloatingAddButton;
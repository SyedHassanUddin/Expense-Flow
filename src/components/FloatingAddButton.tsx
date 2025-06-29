import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-3xl shadow-2xl hover:from-emerald-500 hover:to-emerald-700 hover:scale-110 transition-all duration-300 group border-4 border-white"
      aria-label="Add new expense"
    >
      <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-3xl bg-emerald-400 opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
        Add Expense
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </button>
  );
};

export default FloatingAddButton;
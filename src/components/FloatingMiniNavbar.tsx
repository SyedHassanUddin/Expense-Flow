import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingMiniNavbarProps {
  onAddExpense: () => void;
}

const FloatingMiniNavbar: React.FC<FloatingMiniNavbarProps> = ({
  onAddExpense
}) => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Quick Add Button */}
      <button
        onClick={onAddExpense}
        className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 backdrop-blur-md border border-white/20 rounded-full shadow-xl hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300 text-white group"
        title="Quick Add Expense"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default FloatingMiniNavbar;
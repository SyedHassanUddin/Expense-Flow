import React from 'react';
import { PlusCircle, Coffee, Car, Pizza } from 'lucide-react';

interface EmptyStateProps {
  onAddExpense: () => void;
  searchTerm?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddExpense, searchTerm }) => {
  if (searchTerm) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-12 text-center">
        <div className="text-white/40 mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <Coffee size={32} className="text-white/40" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white/80 mb-2">
          No expenses found for "{searchTerm}"
        </h3>
        <p className="text-white/60 mb-6">
          Try adjusting your search term or add a new expense
        </p>
        <button
          onClick={onAddExpense}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg"
        >
          Add New Expense
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-12 text-center">
      {/* Animated Icons */}
      <div className="flex justify-center space-x-4 mb-6">
        <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
          <Pizza size={32} className="text-orange-400" />
        </div>
        <div className="animate-bounce" style={{ animationDelay: '150ms' }}>
          <Coffee size={32} className="text-amber-400" />
        </div>
        <div className="animate-bounce" style={{ animationDelay: '300ms' }}>
          <Car size={32} className="text-blue-400" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white/90 mb-3">
        No expenses yet! 
      </h3>
      
      <p className="text-lg text-white/70 mb-2">
        Click <span className="font-semibold text-blue-300">+</span> to add your first 🍕 coffee ☕ or ride 🚕
      </p>
      
      <p className="text-sm text-white/50 mb-8 italic">
        "Tracking today helps you save tomorrow."
      </p>
      
      <button
        onClick={onAddExpense}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center mx-auto"
      >
        <PlusCircle size={20} className="mr-2" />
        Add Your First Expense
      </button>
      
      {/* Sample Chart Preview */}
      <div className="mt-12 opacity-30">
        <div className="w-32 h-32 mx-auto border-8 border-white/20 rounded-full relative">
          <div className="absolute inset-2 border-4 border-blue-300/30 rounded-full"></div>
          <div className="absolute inset-4 border-2 border-green-300/30 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/40 font-medium">Sample Chart</span>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2">Your spending breakdown will appear here</p>
      </div>
    </div>
  );
};

export default EmptyState;
import React from 'react';
import { Trash2, Edit, Tag, Calendar, Hash, Banknote, User, Camera } from 'lucide-react';
import { Expense, Currency } from '../types/expense';
import { categoryColors } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/dateFilters';

interface ExpenseItemProps {
  expense: Expense;
  currency: Currency;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, currency, onDelete, onEdit }) => {
  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'bank':
        return <Banknote size={12} className="text-green-600" />;
      case 'receipt':
        return <Camera size={12} className="text-purple-600" />;
      default:
        return <User size={12} className="text-blue-600" />;
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'bank':
        return 'Bank';
      case 'receipt':
        return 'Receipt';
      default:
        return 'Manual';
    }
  };

  const getSourceBadgeColor = (source?: string) => {
    switch (source) {
      case 'bank':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'receipt':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-md hover:bg-white/90 transition-all duration-300 group">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Category Indicator */}
        <div
          className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
          style={{ backgroundColor: categoryColors[expense.category] || '#95A5A6' }}
        ></div>
        
        {/* Expense Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-800 truncate">
              {expense.description}
            </h3>
            
            {/* Source Badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSourceBadgeColor(expense.source)}`}>
              {getSourceIcon(expense.source)}
              <span className="ml-1">{getSourceLabel(expense.source)}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Tag size={12} className="mr-1" />
              <span className="truncate">{expense.category}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              {formatDate(expense.date)}
            </div>
            {expense.quantity > 1 && (
              <div className="flex items-center">
                <Hash size={12} className="mr-1" />
                {expense.quantity}x
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Amount and Actions */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="font-bold text-lg text-gray-800">
            {formatCurrency(expense.amount, currency)}
          </div>
          {expense.quantity > 1 && (
            <div className="text-xs text-gray-500">
              {formatCurrency(expense.amount / expense.quantity, currency)} each
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(expense)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit expense"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(expense.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete expense"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
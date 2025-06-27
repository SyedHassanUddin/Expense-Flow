import React from 'react';
import { Trash2, Tag, Calendar, Hash } from 'lucide-react';
import { Expense, Currency } from '../types/expense';
import { categoryColors } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/dateFilters';

interface ExpenseListProps {
  expenses: Expense[];
  currency: Currency;
  onDelete: (id: string) => void;
  searchTerm: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, currency, onDelete, searchTerm }) => {
  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredExpenses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Tag size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No matching expenses found' : 'No expenses yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `Try adjusting your search term "${searchTerm}"`
              : 'Add your first expense using the form above'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 mt-12">
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Expenses</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredExpenses.length} expenses
          </span>
        </div>
        
        <div className="space-y-4">
          {filteredExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Category Badge */}
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: categoryColors[expense.category] || '#95A5A6' }}
                  ></div>
                  
                  {/* Expense Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {expense.description}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Tag size={14} className="mr-1" />
                        {expense.category}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(expense.date)}
                      </div>
                      {expense.quantity > 1 && (
                        <div className="flex items-center">
                          <Hash size={14} className="mr-1" />
                          {expense.quantity}x
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Amount and Actions */}
                <div className="flex items-center space-x-4">
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
                  
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    title="Delete expense"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
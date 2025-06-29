import React from 'react';
import { Expense, Currency } from '../types/expense';
import ExpenseItem from './ExpenseItem';
import EmptyState from './EmptyState';
import SearchBar from './SearchBar';

interface ExpenseListProps {
  expenses: Expense[];
  currency: Currency;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddExpense: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  currency,
  onDelete,
  onEdit,
  searchTerm,
  onSearchChange,
  onAddExpense
}) => {
  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedExpenses = filteredExpenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-6xl mx-auto px-4 mt-12">
      {expenses.length > 0 && (
        <div className="mb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder="Search by description or category..."
          />
        </div>
      )}

      {sortedExpenses.length === 0 ? (
        <EmptyState onAddExpense={onAddExpense} searchTerm={searchTerm} />
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Expenses</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {sortedExpenses.length} {sortedExpenses.length === 1 ? 'expense' : 'expenses'}
            </span>
          </div>
          
          <div className="space-y-3">
            {sortedExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                currency={currency}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
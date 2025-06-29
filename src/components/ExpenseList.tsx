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
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Expenses</h2>
            <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              {sortedExpenses.length} {sortedExpenses.length === 1 ? 'expense' : 'expenses'}
            </span>
          </div>
          
          {/* Scrollable container for expenses */}
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
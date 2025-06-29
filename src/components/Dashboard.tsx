import React from 'react';
import { Expense, Currency, TimeFilter } from '../types/expense';
import StatsCards from './StatsCards';
import ExpenseChart from './ExpenseChart';
import ExpenseList from './ExpenseList';
import VoiceInput from './VoiceInput';
import BankConnection from './BankConnection';

interface DashboardProps {
  expenses: Expense[];
  currency: Currency;
  timeFilter: TimeFilter;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddExpense: () => void;
  onBankTransactions: (transactions: Expense[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  currency,
  timeFilter,
  onDelete,
  onEdit,
  searchTerm,
  onSearchChange,
  onAddExpense,
  onBankTransactions
}) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards 
        expenses={expenses}
        currency={currency}
        timeFilter={timeFilter}
      />

      {/* Voice Input and Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VoiceInput onAddExpense={onAddExpense} />
        <div className="lg:col-span-2">
          <ExpenseChart 
            expenses={expenses}
            currency={currency}
          />
        </div>
      </div>

      {/* Bank Connection */}
      <BankConnection 
        onTransactionsImported={onBankTransactions}
        currency={currency}
      />

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        currency={currency}
        onDelete={onDelete}
        onEdit={onEdit}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onAddExpense={onAddExpense}
      />
    </div>
  );
};

export default Dashboard;
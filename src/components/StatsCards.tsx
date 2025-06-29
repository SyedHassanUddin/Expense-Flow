import React from 'react';
import { Expense, Currency } from '../types/expense';
import { formatCurrencyAmount } from '../utils/currencyConverter';

interface StatsCardsProps {
  expenses: Expense[];
  currency: Currency;
  timeFilter: string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ expenses, currency, timeFilter }) => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalTransactions = expenses.length;
  const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Daily Intake';
      case 'week': return 'Weekly Intake';
      case 'month': return 'Monthly Intake';
      default: return 'Total Intake';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Daily Intake */}
      <div className="stats-card green">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">{getTimeFilterLabel()}</div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrencyAmount(totalAmount, currency)}
            </div>
          </div>
          <div className="progress-circle green">
            <div className="progress-text">60%</div>
          </div>
        </div>
      </div>

      {/* Average Intake */}
      <div className="stats-card blue">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">Average Intake</div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrencyAmount(averageAmount, currency)}
            </div>
          </div>
          <div className="progress-circle blue">
            <div className="progress-text">85%</div>
          </div>
        </div>
      </div>

      {/* Total Intake */}
      <div className="stats-card purple">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">Total Intake</div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrencyAmount(totalAmount * 7, currency)}
            </div>
          </div>
          <div className="progress-circle purple">
            <div className="progress-text">69%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
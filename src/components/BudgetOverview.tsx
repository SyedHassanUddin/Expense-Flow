import React from 'react';
import { Target, AlertTriangle, CheckCircle, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { BudgetStatus, Budget } from '../types/budget';
import { Currency } from '../types/expense';
import { formatCurrencyAmount } from '../utils/currencyConverter';
import { formatMonth } from '../utils/budgetUtils';
import { GlassCard } from './ui/card';

interface BudgetOverviewProps {
  budgets: Budget[];
  budgetStatuses: BudgetStatus[];
  currency: Currency;
  selectedMonth: string;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
  onAddBudget: () => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgets,
  budgetStatuses,
  currency,
  selectedMonth,
  onEditBudget,
  onDeleteBudget,
  onAddBudget
}) => {
  const monthBudgets = budgets.filter(budget => budget.month === selectedMonth);

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (status: BudgetStatus) => {
    if (status.isOverBudget) {
      return <AlertTriangle size={16} className="text-red-400" />;
    }
    if (status.isNearLimit) {
      return <AlertTriangle size={16} className="text-yellow-400" />;
    }
    return <CheckCircle size={16} className="text-green-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <GlassCard className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-3 mr-4">
              <Target size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Budget Overview</h2>
              <p className="text-white/70">{formatMonth(selectedMonth)}</p>
            </div>
          </div>
          
          <button
            onClick={onAddBudget}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center"
          >
            <Target size={16} className="mr-2" />
            Set Budget
          </button>
        </div>

        {monthBudgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/40 mb-4">
              <Target size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              No budgets set for {formatMonth(selectedMonth)}
            </h3>
            <p className="text-white/60 mb-6">
              Set budgets for your expense categories to track your spending goals
            </p>
            <button
              onClick={onAddBudget}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
            >
              Create Your First Budget
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetStatuses.map((status) => {
              const budget = monthBudgets.find(b => b.category === status.category);
              if (!budget) return null;

              return (
                <div
                  key={status.category}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status)}
                      <h3 className="font-semibold text-white">{status.category}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditBudget(budget)}
                        className="p-2 text-white/60 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                        title="Edit budget"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => onDeleteBudget(budget.id)}
                        className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                        title="Delete budget"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">
                        {formatCurrencyAmount(status.spentAmount, currency)} of {formatCurrencyAmount(status.budgetAmount, currency)}
                      </span>
                      <span className={`font-semibold ${
                        status.isOverBudget ? 'text-red-300' : 
                        status.isNearLimit ? 'text-yellow-300' : 'text-green-300'
                      }`}>
                        {status.percentage.toFixed(1)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getProgressColor(status.percentage, status.isOverBudget)}`}
                        style={{ 
                          width: `${Math.min(100, status.percentage)}%` 
                        }}
                      ></div>
                      {status.isOverBudget && (
                        <div
                          className="h-full bg-red-600 opacity-50"
                          style={{ 
                            width: `${Math.min(100, status.percentage - 100)}%`,
                            marginTop: '-8px'
                          }}
                        ></div>
                      )}
                    </div>

                    {/* Status Message */}
                    {status.isOverBudget && (
                      <p className="text-red-300 text-xs">
                        Over budget by {formatCurrencyAmount(status.spentAmount - status.budgetAmount, currency)}
                      </p>
                    )}
                    {status.isNearLimit && !status.isOverBudget && (
                      <p className="text-yellow-300 text-xs">
                        Approaching budget limit - {formatCurrencyAmount(status.budgetAmount - status.spentAmount, currency)} remaining
                      </p>
                    )}
                    {!status.isNearLimit && !status.isOverBudget && (
                      <p className="text-green-300 text-xs">
                        {formatCurrencyAmount(status.budgetAmount - status.spentAmount, currency)} remaining
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {budgetStatuses.filter(s => !s.isNearLimit && !s.isOverBudget).length}
                  </div>
                  <div className="text-sm text-white/70">On Track</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {budgetStatuses.filter(s => s.isNearLimit && !s.isOverBudget).length}
                  </div>
                  <div className="text-sm text-white/70">Near Limit</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {budgetStatuses.filter(s => s.isOverBudget).length}
                  </div>
                  <div className="text-sm text-white/70">Over Budget</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default BudgetOverview;
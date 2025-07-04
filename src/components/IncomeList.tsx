import React from 'react';
import { Trash2, Edit, Calendar, Building, DollarSign, Repeat } from 'lucide-react';
import { Income, Currency } from '../types/income';
import { formatCurrencyAmount } from '../utils/currencyConverter';
import { formatDate } from '../utils/dateFilters';
import { GlassCard } from './ui/card';

interface IncomeListProps {
  income: Income[];
  currency: Currency;
  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
  onAddIncome: () => void;
}

const IncomeList: React.FC<IncomeListProps> = ({
  income,
  currency,
  onDelete,
  onEdit,
  onAddIncome
}) => {
  const sortedIncome = income
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getFrequencyIcon = (frequency?: string) => {
    if (!frequency) return null;
    return <Repeat size={12} className="text-blue-300" />;
  };

  const getFrequencyLabel = (frequency?: string) => {
    if (!frequency) return '';
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <GlassCard className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Income History</h2>
          <button
            onClick={onAddIncome}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center"
          >
            <DollarSign size={16} className="mr-2" />
            Add Income
          </button>
        </div>

        {sortedIncome.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/40 mb-4">
              <DollarSign size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              No income recorded yet
            </h3>
            <p className="text-white/60 mb-6">
              Start tracking your income sources to get a complete financial picture
            </p>
            <button
              onClick={onAddIncome}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
            >
              Add Your First Income
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedIncome.map((incomeItem) => (
              <div
                key={incomeItem.id}
                className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Income Indicator */}
                  <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0 shadow-sm border border-white/20"></div>
                  
                  {/* Income Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {incomeItem.source}
                      </h3>
                      
                      {/* Recurring Badge */}
                      {incomeItem.is_recurring && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-300 border-blue-400/30">
                          {getFrequencyIcon(incomeItem.recurring_frequency)}
                          <span className="ml-1">{getFrequencyLabel(incomeItem.recurring_frequency)}</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(incomeItem.date)}
                      </div>
                      <div className="flex items-center">
                        <Building size={12} className="mr-1" />
                        <span className="truncate">Income</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Amount and Actions */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-300">
                      +{formatCurrencyAmount(incomeItem.amount, currency)}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEdit(incomeItem)}
                      className="p-2 text-white/60 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                      title="Edit income"
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => onDelete(incomeItem.id)}
                      className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                      title="Delete income"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default IncomeList;
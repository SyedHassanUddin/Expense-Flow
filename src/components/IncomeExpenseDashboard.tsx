import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Target, AlertTriangle, Plus, Eye, ArrowUpRight } from 'lucide-react';
import { Expense, Currency } from '../types/expense';
import { Income } from '../types/income';
import { BudgetStatus } from '../types/budget';
import { formatCurrencyAmount } from '../utils/currencyConverter';
import { formatMonth, getCurrentMonth } from '../utils/budgetUtils';
import { GlassCard } from './ui/card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface IncomeExpenseDashboardProps {
  expenses: Expense[];
  income: Income[];
  budgetStatuses: BudgetStatus[];
  currency: Currency;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onAddBudget?: () => void;
  onViewIncomeDetails?: () => void;
  onViewExpenseDetails?: () => void;
  onViewBudgetDetails?: () => void;
}

const IncomeExpenseDashboard: React.FC<IncomeExpenseDashboardProps> = ({
  expenses,
  income,
  budgetStatuses,
  currency,
  selectedMonth,
  onMonthChange,
  onAddIncome,
  onAddExpense,
  onAddBudget,
  onViewIncomeDetails,
  onViewExpenseDetails,
  onViewBudgetDetails
}) => {
  const [chartData, setChartData] = useState<any>(null);

  // Filter data for selected month
  const monthExpenses = expenses.filter(expense => 
    expense.date.substring(0, 7) === selectedMonth
  );
  const monthIncome = income.filter(inc => 
    inc.date.substring(0, 7) === selectedMonth
  );

  // Calculate totals
  const totalIncome = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Prepare chart data
  useEffect(() => {
    // Income vs Expense Bar Chart
    const barData = {
      labels: ['Income', 'Expenses', 'Net Savings'],
      datasets: [{
        label: 'Amount',
        data: [totalIncome, totalExpenses, Math.max(0, netSavings)],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for income
          'rgba(239, 68, 68, 0.8)',   // Red for expenses
          'rgba(59, 130, 246, 0.8)'   // Blue for savings
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };

    setChartData(barData);
  }, [monthExpenses, monthIncome, totalIncome, totalExpenses, netSavings]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${formatCurrencyAmount(context.raw, currency)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value: any) {
            return formatCurrencyAmount(value, currency);
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  // Get month options for dropdown
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    // Last 6 months and next 6 months
    for (let i = -6; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      options.push({ value, label });
    }
    
    return options;
  };

  // Budget alerts
  const criticalBudgets = budgetStatuses.filter(status => status.isOverBudget);
  const warningBudgets = budgetStatuses.filter(status => status.isNearLimit);

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8 mb-8">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Financial Dashboard</h2>
        <div className="flex items-center space-x-3">
          <Calendar size={20} className="text-white/70" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {getMonthOptions().map(option => (
              <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget Alerts */}
      {(criticalBudgets.length > 0 || warningBudgets.length > 0) && (
        <div className="mb-6 space-y-3">
          {criticalBudgets.map(status => (
            <div key={status.category} className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-red-400 mr-3" />
                <div>
                  <h4 className="font-semibold text-red-200">Budget Exceeded!</h4>
                  <p className="text-red-300 text-sm">
                    {status.category}: {formatCurrencyAmount(status.spentAmount, currency)} / {formatCurrencyAmount(status.budgetAmount, currency)} 
                    ({status.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {warningBudgets.map(status => (
            <div key={status.category} className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-yellow-400 mr-3" />
                <div>
                  <h4 className="font-semibold text-yellow-200">Budget Warning</h4>
                  <p className="text-yellow-300 text-sm">
                    {status.category}: {formatCurrencyAmount(status.spentAmount, currency)} / {formatCurrencyAmount(status.budgetAmount, currency)} 
                    ({status.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Income Card */}
        <GlassCard className="p-4 sm:p-6 hover:scale-105 transition-all duration-150 glow-green cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/70 bg-green-500/20 px-2 py-1 rounded-full">
                Income
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex space-x-1">
                {onAddIncome && (
                  <button
                    onClick={onAddIncome}
                    className="p-1 bg-green-500/20 hover:bg-green-500/30 rounded-full transition-colors duration-150"
                    title="Add Income"
                  >
                    <Plus size={14} className="text-green-300" />
                  </button>
                )}
                {onViewIncomeDetails && (
                  <button
                    onClick={onViewIncomeDetails}
                    className="p-1 bg-green-500/20 hover:bg-green-500/30 rounded-full transition-colors duration-150"
                    title="View Details"
                  >
                    <Eye size={14} className="text-green-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {formatCurrencyAmount(totalIncome, currency)}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-sm">
              {monthIncome.length} source{monthIncome.length !== 1 ? 's' : ''}
            </p>
            {totalIncome > 0 && (
              <ArrowUpRight size={16} className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            )}
          </div>
          {totalIncome === 0 && onAddIncome && (
            <button
              onClick={onAddIncome}
              className="w-full mt-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 text-sm font-medium transition-colors duration-150"
            >
              Add First Income
            </button>
          )}
        </GlassCard>

        {/* Total Expenses Card */}
        <GlassCard className="p-4 sm:p-6 hover:scale-105 transition-all duration-150 glow-red cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full p-3">
              <TrendingDown size={20} className="text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/70 bg-red-500/20 px-2 py-1 rounded-full">
                Expenses
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex space-x-1">
                {onAddExpense && (
                  <button
                    onClick={onAddExpense}
                    className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors duration-150"
                    title="Add Expense"
                  >
                    <Plus size={14} className="text-red-300" />
                  </button>
                )}
                {onViewExpenseDetails && (
                  <button
                    onClick={onViewExpenseDetails}
                    className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors duration-150"
                    title="View Details"
                  >
                    <Eye size={14} className="text-red-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {formatCurrencyAmount(totalExpenses, currency)}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-sm">
              {monthExpenses.length} transaction{monthExpenses.length !== 1 ? 's' : ''}
            </p>
            {totalExpenses > 0 && (
              <ArrowUpRight size={16} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            )}
          </div>
          {totalExpenses === 0 && onAddExpense && (
            <button
              onClick={onAddExpense}
              className="w-full mt-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-colors duration-150"
            >
              Add First Expense
            </button>
          )}
        </GlassCard>

        {/* Net Savings Card */}
        <GlassCard className={`p-4 sm:p-6 hover:scale-105 transition-all duration-150 cursor-pointer group ${netSavings >= 0 ? 'glow-blue' : 'glow-red'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-gradient-to-r ${netSavings >= 0 ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600'} rounded-full p-3`}>
              <DollarSign size={20} className="text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs text-white/70 ${netSavings >= 0 ? 'bg-blue-500/20' : 'bg-red-500/20'} px-2 py-1 rounded-full`}>
                {netSavings >= 0 ? 'Savings' : 'Deficit'}
              </span>
              {(totalIncome > 0 || totalExpenses > 0) && (
                <ArrowUpRight size={16} className={`${netSavings >= 0 ? 'text-blue-400' : 'text-red-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-150`} />
              )}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {formatCurrencyAmount(Math.abs(netSavings), currency)}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-sm">
              {savingsRate.toFixed(1)}% of income
            </p>
            {netSavings < 0 && (
              <span className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-full">
                Over Budget
              </span>
            )}
          </div>
          {totalIncome === 0 && totalExpenses === 0 && (
            <div className="mt-3 text-center">
              <p className="text-white/60 text-xs">Add income and expenses to see savings</p>
            </div>
          )}
        </GlassCard>

        {/* Budget Status Card */}
        <GlassCard className="p-4 sm:p-6 hover:scale-105 transition-all duration-150 glow-purple cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-3">
              <Target size={20} className="text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/70 bg-purple-500/20 px-2 py-1 rounded-full">
                Budgets
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex space-x-1">
                {onAddBudget && (
                  <button
                    onClick={onAddBudget}
                    className="p-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-full transition-colors duration-150"
                    title="Add Budget"
                  >
                    <Plus size={14} className="text-purple-300" />
                  </button>
                )}
                {onViewBudgetDetails && (
                  <button
                    onClick={onViewBudgetDetails}
                    className="p-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-full transition-colors duration-150"
                    title="View Details"
                  >
                    <Eye size={14} className="text-purple-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {budgetStatuses.length}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-sm">
              {criticalBudgets.length} over, {warningBudgets.length} warning
            </p>
            {budgetStatuses.length > 0 && (
              <ArrowUpRight size={16} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            )}
          </div>
          {budgetStatuses.length === 0 && onAddBudget && (
            <button
              onClick={onAddBudget}
              className="w-full mt-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition-colors duration-150"
            >
              Set First Budget
            </button>
          )}
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {/* Income vs Expenses Bar Chart */}
        <GlassCard className="p-4 sm:p-6 hover:scale-105 transition-all duration-150">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 mr-4">
              <BarChart3 size={20} sm:size={24} className="text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">Income vs Expenses</h3>
          </div>
          
          <div className="h-48 sm:h-64">
            {chartData && <Bar data={chartData} options={chartOptions} />}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-white/70">
              {formatMonth(selectedMonth)}
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default IncomeExpenseDashboard;
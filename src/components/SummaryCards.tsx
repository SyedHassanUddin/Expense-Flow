import React, { useState, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Expense, Currency } from '../types/expense';
import { categoryColors } from '../utils/categories';
import { formatCurrency } from '../utils/dateFilters';
import { convertExpenseAmount, formatCurrencyAmount } from '../utils/currencyConverter';
import { TrendingUp, PieChart, Calendar, BarChart3, Loader } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface SummaryCardsProps {
  expenses: Expense[];
  currency: Currency;
  timeFilter: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses, currency, timeFilter }) => {
  const [convertedExpenses, setConvertedExpenses] = useState<Expense[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string>('');

  // Convert all expenses to the selected currency
  useEffect(() => {
    const convertExpenses = async () => {
      if (expenses.length === 0) {
        setConvertedExpenses([]);
        return;
      }

      setIsConverting(true);
      setConversionError('');

      try {
        const converted = await Promise.all(
          expenses.map(async (expense) => {
            if (expense.currency === currency) {
              return expense; // No conversion needed
            }

            const convertedAmount = await convertExpenseAmount(
              expense.amount,
              expense.currency,
              currency
            );

            return {
              ...expense,
              amount: convertedAmount,
              currency: currency
            };
          })
        );

        setConvertedExpenses(converted);
      } catch (error) {
        console.error('Currency conversion failed:', error);
        setConversionError('Currency conversion failed. Showing original amounts.');
        setConvertedExpenses(expenses);
      } finally {
        setIsConverting(false);
      }
    };

    convertExpenses();
  }, [expenses, currency]);

  const workingExpenses = convertedExpenses.length > 0 ? convertedExpenses : expenses;
  const totalAmount = workingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalTransactions = workingExpenses.length;
  
  // Calculate average spending
  const averageSpending = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
  
  // Calculate daily average for the time period
  const getDailyAverage = () => {
    if (totalTransactions === 0) return 0;
    
    switch (timeFilter) {
      case 'today':
        return totalAmount; // Same as total for today
      case 'week':
        return totalAmount / 7;
      case 'month':
        return totalAmount / 30;
      default:
        // For 'all', calculate based on date range
        if (workingExpenses.length === 0) return 0;
        
        const dates = workingExpenses.map(e => new Date(e.date));
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        return totalAmount / daysDiff;
    }
  };

  const dailyAverage = getDailyAverage();
  
  // Group by category for chart
  const categoryTotals = workingExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Prepare data for spending trend (last 7 days)
  const getSpendingTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailySpending = last7Days.map(date => {
      const dayExpenses = workingExpenses.filter(expense => expense.date === date);
      return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Daily Spending',
        data: dailySpending,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const trendData = getSpendingTrendData();
  
  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: Object.keys(categoryTotals).map(cat => categoryColors[cat] || '#95A5A6'),
      borderWidth: 0,
      hoverBorderWidth: 2,
      hoverBorderColor: '#fff'
    }]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = formatCurrencyAmount(context.raw, currency);
            const percentage = ((context.raw / totalAmount) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
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
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrencyAmount(value, currency);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
      {conversionError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-700">⚠️ {conversionError}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Total Expenses Card with Average Spending */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {getTimeFilterLabel()}
              </span>
              {isConverting && (
                <div className="flex items-center mt-1">
                  <Loader size={12} className="animate-spin mr-1" />
                  <span className="text-xs text-gray-500">Converting...</span>
                </div>
              )}
            </div>
          </div>
          
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {formatCurrencyAmount(totalAmount, currency)}
          </h3>
          <p className="text-gray-600 mb-4">Total Expenses</p>
          
          {/* Average Spending Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 size={16} className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Avg per transaction</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrencyAmount(averageSpending, currency)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar size={16} className="text-green-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Daily average ({timeFilter === 'today' ? 'today' : timeFilter})
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrencyAmount(dailyAverage, currency)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar size={16} className="text-purple-500 mr-2" />
                <span className="text-sm text-gray-600">Total transactions</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {totalTransactions}
              </span>
            </div>
          </div>

          {/* Mini Trend Chart */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="h-16">
              <Line data={trendData} options={trendOptions} />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              7-day spending trend
            </p>
          </div>
        </div>
        
        {/* Enhanced Chart Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 mr-4">
                <PieChart size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Spending Breakdown</h3>
            </div>
            {isConverting && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader size={16} className="animate-spin mr-2" />
                Converting currencies...
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Chart */}
            <div className="h-48 relative">
              {Object.keys(categoryTotals).length > 0 ? (
                <>
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {totalTransactions}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expenses
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No expenses to display</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => {
                  const percentage = ((amount / totalAmount) * 100).toFixed(1);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: categoryColors[category] || '#95A5A6' }}
                        ></div>
                        <span className="text-sm text-gray-700 truncate max-w-24">
                          {category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">
                          {formatCurrencyAmount(amount, currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {/* Currency Conversion Info */}
              {convertedExpenses.length > 0 && !isConverting && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      💱 Amounts converted to {currency} using real-time exchange rates
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
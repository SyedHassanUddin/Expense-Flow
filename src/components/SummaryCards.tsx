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
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
      }]
    };
  };

  const trendData = getSpendingTrendData();
  
  // Pastel colors for the chart
  const pastelColors = [
    '#FFB6C1', // Light Pink
    '#98FB98', // Pale Green
    '#FFE4B5', // Moccasin
    '#E0E6FF', // Lavender
    '#FFEAA7', // Light Yellow
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#FFA07A'  // Light Salmon
  ];
  
  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: pastelColors.slice(0, Object.keys(categoryTotals).length),
      borderWidth: 3,
      borderColor: '#ffffff',
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff'
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 2,
        cornerRadius: 12,
        padding: 12,
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
    cutout: '60%'
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 2,
        cornerRadius: 12,
        padding: 12,
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
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Poppins',
            size: 12
          },
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
          color: '#6B7280',
          font: {
            family: 'Poppins',
            size: 12
          }
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
        <div className="mb-4 p-3 bg-yellow-100 border-2 border-yellow-300 rounded-2xl">
          <p className="text-sm text-yellow-800">⚠️ {conversionError}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Total Expenses Card */}
        <div className="notebook-card p-8 soft-hover">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                {getTimeFilterLabel()}
              </span>
              {isConverting && (
                <div className="flex items-center mt-1">
                  <Loader size={12} className="animate-spin mr-1 text-gray-500" />
                  <span className="text-xs text-gray-500">Converting...</span>
                </div>
              )}
            </div>
          </div>
          
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            {formatCurrencyAmount(totalAmount, currency)}
          </h3>
          <p className="text-gray-600 mb-6 font-medium">Total Expenses</p>
          
          {/* Average Spending Section */}
          <div className="space-y-4 pt-4 border-t-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 size={16} className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-600 font-medium">Avg per transaction</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {formatCurrencyAmount(averageSpending, currency)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar size={16} className="text-green-500 mr-2" />
                <span className="text-sm text-gray-600 font-medium">
                  Daily average
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {formatCurrencyAmount(dailyAverage, currency)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar size={16} className="text-purple-500 mr-2" />
                <span className="text-sm text-gray-600 font-medium">Total transactions</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {totalTransactions}
              </span>
            </div>
          </div>

          {/* Mini Trend Chart */}
          <div className="mt-6 pt-4 border-t-2 border-gray-100">
            <div className="h-16">
              <Line data={trendData} options={trendOptions} />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center font-medium">
              7-day spending trend
            </p>
          </div>
        </div>
        
        {/* Enhanced Chart Card */}
        <div className="notebook-card p-8 soft-hover lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
                <PieChart size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Chart Analytics</h3>
            </div>
            {isConverting && (
              <div className="flex items-center text-sm text-gray-600">
                <Loader size={16} className="animate-spin mr-2" />
                Converting currencies...
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Chart */}
            <div className="h-64 relative">
              {Object.keys(categoryTotals).length > 0 ? (
                <>
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {totalTransactions}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Expenses
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No expenses to display</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="space-y-4">
              {Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, amount], index) => {
                  const percentage = ((amount / totalAmount) * 100).toFixed(1);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 border-2 border-white shadow-sm"
                          style={{ backgroundColor: pastelColors[index] }}
                        ></div>
                        <span className="text-sm text-gray-700 font-medium truncate max-w-24">
                          {category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">
                          {formatCurrencyAmount(amount, currency)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {/* Tech Used Footer */}
              <div className="pt-4 border-t-2 border-gray-100">
                <div className="bg-gradient-to-r from-pink-100 to-blue-100 border-2 border-pink-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-700 font-bold mb-1">
                    Tech Used: Chart.js
                  </p>
                  <p className="text-xs text-gray-600">
                    Displays category-wise spendings in a donut chart. Filters available: daily, weekly, monthly
                  </p>
                </div>
              </div>
              
              {/* Currency Conversion Info */}
              {convertedExpenses.length > 0 && !isConverting && (
                <div className="bg-blue-100 border-2 border-blue-200 rounded-2xl p-3">
                  <p className="text-xs text-blue-700 font-medium">
                    💱 Amounts converted to {currency} using real-time exchange rates
                  </p>
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
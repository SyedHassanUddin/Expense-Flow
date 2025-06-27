import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Expense, Currency } from '../types/expense';
import { categoryColors } from '../utils/categories';
import { formatCurrency } from '../utils/dateFilters';
import { TrendingUp, PieChart, Calendar } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SummaryCardsProps {
  expenses: Expense[];
  currency: Currency;
  timeFilter: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses, currency, timeFilter }) => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalTransactions = expenses.length;
  
  // Group by category for chart
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
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
            const value = formatCurrency(context.raw, currency);
            const percentage = ((context.raw / totalAmount) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Expenses Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {getTimeFilterLabel()}
            </span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {formatCurrency(totalAmount, currency)}
          </h3>
          <p className="text-gray-600">Total Expenses</p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2" />
            {totalTransactions} transactions
          </div>
        </div>
        
        {/* Chart Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 mr-4">
                <PieChart size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Spending Breakdown</h3>
            </div>
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
                          {formatCurrency(amount, currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
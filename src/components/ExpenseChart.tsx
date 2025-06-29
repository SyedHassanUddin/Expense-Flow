import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Expense, Currency } from '../types/expense';
import { categoryColors } from '../utils/categories';
import { formatCurrencyAmount } from '../utils/currencyConverter';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  expenses: Expense[];
  currency: Currency;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  // Group by category for chart
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Modern pastel colors
  const chartColors = [
    '#60A5FA', // Blue
    '#34D399', // Green  
    '#F59E0B', // Orange
    '#A78BFA', // Purple
    '#FB7185', // Pink
    '#10B981', // Emerald
    '#F97316', // Orange
    '#8B5CF6'  // Violet
  ];

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: chartColors.slice(0, Object.keys(categoryTotals).length),
      borderWidth: 0,
      hoverBorderWidth: 2,
      hoverBorderColor: '#FFFFFF'
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
        backgroundColor: '#FFFFFF',
        titleColor: '#1E293B',
        bodyColor: '#64748B',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
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

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Chart Analytics</h3>
        <div className="text-sm text-slate-500">
          Displays category-wise spendings in a donut chart
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Chart */}
        <div className="h-64 relative">
          {Object.keys(categoryTotals).length > 0 ? (
            <>
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-800">Pans</div>
                  <div className="text-sm text-slate-500">Center</div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
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
            .map(([category, amount], index) => {
              const percentage = ((amount / totalAmount) * 100).toFixed(1);
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: chartColors[index] }}
                    ></div>
                    <span className="text-sm text-slate-700 font-medium">
                      {category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-800">
                      {formatCurrencyAmount(amount, currency)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Tech Used */}
          <div className="pt-4 border-t border-slate-200">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-700 mb-1">
                Tech Used: Chart.js
              </div>
              <div className="text-xs text-slate-500">
                Filters available: daily, weekly, monthly
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
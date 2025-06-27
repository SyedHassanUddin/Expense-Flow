import { Expense, TimeFilter } from '../types/expense';

export function filterExpensesByTime(expenses: Expense[], filter: TimeFilter): Expense[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= today;
      });
      
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekAgo;
      });
      
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthAgo;
      });
      
    case 'all':
    default:
      return expenses;
  }
}

export function formatCurrency(amount: number, currency: string): string {
  return `${currency}${amount.toLocaleString()}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
import { Expense } from '../types/expense';

const STORAGE_KEY = 'expenseflow-expenses';

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses:', error);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load expenses:', error);
  }
  
  // Return sample data if no data exists
  return getSampleExpenses();
}

function getSampleExpenses(): Expense[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return [
    {
      id: '1',
      amount: 450,
      quantity: 2,
      description: 'Pizza dinner with friends',
      date: today.toISOString().split('T')[0],
      category: 'Food & Dining',
      currency: '₹'
    },
    {
      id: '2',
      amount: 120,
      quantity: 1,
      description: 'Uber ride to office',
      date: yesterday.toISOString().split('T')[0],
      category: 'Transportation',
      currency: '₹'
    },
    {
      id: '3',
      amount: 2500,
      quantity: 1,
      description: 'New shirt from mall',
      date: lastWeek.toISOString().split('T')[0],
      category: 'Shopping',
      currency: '₹'
    },
    {
      id: '4',
      amount: 350,
      quantity: 1,
      description: 'Movie tickets',
      date: lastWeek.toISOString().split('T')[0],
      category: 'Entertainment',
      currency: '₹'
    }
  ];
}

export function exportToCSV(expenses: Expense[], filename: string = 'expenses.csv'): void {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Quantity'];
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => [
      expense.date,
      `"${expense.description}"`,
      expense.category,
      expense.amount,
      expense.currency,
      expense.quantity
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
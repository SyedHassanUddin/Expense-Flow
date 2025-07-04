import { Income } from '../types/income';

const INCOME_STORAGE_KEY = 'expenseflow-income';

export function saveIncome(income: Income[]): void {
  try {
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(income));
  } catch (error) {
    console.error('Failed to save income:', error);
  }
}

export function loadIncome(): Income[] {
  try {
    const stored = localStorage.getItem(INCOME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load income:', error);
  }
  
  return [];
}

export function exportIncomeToCSV(income: Income[], filename: string = 'income.csv'): void {
  const headers = ['Date', 'Source', 'Amount', 'Currency', 'Recurring', 'Frequency'];
  const csvContent = [
    headers.join(','),
    ...income.map(inc => [
      inc.date,
      `"${inc.source}"`,
      inc.amount,
      inc.currency,
      inc.is_recurring || false,
      inc.recurring_frequency || ''
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
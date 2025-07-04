import { Budget } from '../types/budget';

const BUDGET_STORAGE_KEY = 'expenseflow-budgets';

export function saveBudgets(budgets: Budget[]): void {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Failed to save budgets:', error);
  }
}

export function loadBudgets(): Budget[] {
  try {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load budgets:', error);
  }
  
  return [];
}

export function exportBudgetsToCSV(budgets: Budget[], filename: string = 'budgets.csv'): void {
  const headers = ['Month', 'Category', 'Amount', 'Currency'];
  const csvContent = [
    headers.join(','),
    ...budgets.map(budget => [
      budget.month,
      `"${budget.category}"`,
      budget.amount,
      budget.currency
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
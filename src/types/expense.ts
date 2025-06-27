export interface Expense {
  id: string;
  amount: number;
  quantity: number;
  description: string;
  date: string;
  category: string;
  currency: string;
}

export type Currency = '₹' | '$' | '€' | '£';

export type TimeFilter = 'today' | 'week' | 'month' | 'all';

export interface ExpenseFormData {
  amount: string;
  quantity: string;
  description: string;
  date: string;
}
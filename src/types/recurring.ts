export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  source?: string; // For income
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  last_processed?: string;
}

export interface RecurringFormData {
  type: 'income' | 'expense';
  amount: string;
  description: string;
  category: string;
  source?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
}
export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  currency: string;
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface IncomeFormData {
  amount: string;
  source: string;
  date: string;
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
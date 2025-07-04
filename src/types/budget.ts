export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  currency: string;
}

export interface BudgetFormData {
  category: string;
  amount: string;
  month: string;
}

export interface BudgetStatus {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean; // 80%+ of budget used
}
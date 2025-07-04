import { Expense } from '../types/expense';
import { Budget, BudgetStatus } from '../types/budget';

export function calculateBudgetStatus(
  budgets: Budget[],
  expenses: Expense[],
  month: string
): BudgetStatus[] {
  const monthBudgets = budgets.filter(budget => budget.month === month);
  const monthExpenses = expenses.filter(expense => {
    const expenseMonth = expense.date.substring(0, 7); // YYYY-MM
    return expenseMonth === month;
  });

  return monthBudgets.map(budget => {
    const categoryExpenses = monthExpenses.filter(
      expense => expense.category === budget.category
    );
    
    const spentAmount = categoryExpenses.reduce(
      (sum, expense) => sum + expense.amount, 
      0
    );
    
    const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
    
    return {
      category: budget.category,
      budgetAmount: budget.amount,
      spentAmount,
      percentage,
      isOverBudget: spentAmount > budget.amount,
      isNearLimit: percentage >= 80 && percentage < 100
    };
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}

export function getMonthOptions(): { value: string; label: string }[] {
  const options = [];
  const now = new Date();
  
  // Current month and next 11 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    options.push({ value, label });
  }
  
  return options;
}

export function shouldShowBudgetAlert(status: BudgetStatus): boolean {
  return status.isNearLimit || status.isOverBudget;
}

export function getBudgetAlertMessage(status: BudgetStatus): string {
  if (status.isOverBudget) {
    const overAmount = status.spentAmount - status.budgetAmount;
    return `⚠️ ${status.category} budget exceeded by ${overAmount.toFixed(2)}! (${status.percentage.toFixed(1)}%)`;
  }
  
  if (status.isNearLimit) {
    return `🔔 ${status.category} budget is ${status.percentage.toFixed(1)}% used. Consider reducing spending.`;
  }
  
  return '';
}
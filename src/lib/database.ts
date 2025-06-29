import { supabase } from './supabase';
import { Expense } from '../types/expense';

export interface DatabaseExpense {
  id: string;
  user_id: string;
  amount: number;
  quantity: number;
  description: string;
  date: string;
  category: string;
  currency: string;
  source: string;
  created_at: string;
  updated_at: string;
}

// Convert database expense to app expense format
function dbExpenseToExpense(dbExpense: DatabaseExpense): Expense {
  return {
    id: dbExpense.id,
    amount: dbExpense.amount,
    quantity: dbExpense.quantity,
    description: dbExpense.description,
    date: dbExpense.date,
    category: dbExpense.category,
    currency: dbExpense.currency,
    source: dbExpense.source as 'manual' | 'bank' | 'receipt'
  };
}

// Convert app expense to database format
function expenseToDbExpense(expense: Omit<Expense, 'id'>, userId: string): Omit<DatabaseExpense, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    amount: expense.amount,
    quantity: expense.quantity,
    description: expense.description,
    date: expense.date,
    category: expense.category,
    currency: expense.currency,
    source: expense.source || 'manual'
  };
}

export class ExpenseDatabase {
  // Get all expenses for the current user
  static async getExpenses(): Promise<Expense[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(dbExpenseToExpense);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw new Error('Failed to fetch expenses');
    }
  }

  // Add a new expense
  static async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbExpense = expenseToDbExpense(expense, user.id);

      const { data, error } = await supabase
        .from('expenses')
        .insert([dbExpense])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return dbExpenseToExpense(data);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw new Error('Failed to add expense');
    }
  }

  // Update an existing expense
  static async updateExpense(expense: Expense): Promise<Expense> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('expenses')
        .update({
          amount: expense.amount,
          quantity: expense.quantity,
          description: expense.description,
          date: expense.date,
          category: expense.category,
          currency: expense.currency,
          source: expense.source || 'manual'
        })
        .eq('id', expense.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return dbExpenseToExpense(data);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error('Failed to update expense');
    }
  }

  // Delete an expense
  static async deleteExpense(expenseId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error('Failed to delete expense');
    }
  }

  // Delete all expenses for the current user
  static async deleteAllExpenses(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting all expenses:', error);
      throw new Error('Failed to delete all expenses');
    }
  }

  // Import multiple expenses (for bank transactions)
  static async importExpenses(expenses: Omit<Expense, 'id'>[]): Promise<Expense[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbExpenses = expenses.map(expense => expenseToDbExpense(expense, user.id));

      const { data, error } = await supabase
        .from('expenses')
        .insert(dbExpenses)
        .select();

      if (error) {
        throw error;
      }

      return data.map(dbExpenseToExpense);
    } catch (error) {
      console.error('Error importing expenses:', error);
      throw new Error('Failed to import expenses');
    }
  }
}
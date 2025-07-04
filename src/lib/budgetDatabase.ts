import { supabase } from './supabase';
import { Budget } from '../types/budget';

export interface DatabaseBudget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

// Convert database budget to app budget format
function dbBudgetToBudget(dbBudget: DatabaseBudget): Budget {
  return {
    id: dbBudget.id,
    category: dbBudget.category,
    amount: dbBudget.amount,
    month: dbBudget.month,
    currency: dbBudget.currency
  };
}

// Convert app budget to database format
function budgetToDbBudget(budget: Omit<Budget, 'id'>, userId: string): Omit<DatabaseBudget, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    category: budget.category,
    amount: budget.amount,
    month: budget.month,
    currency: budget.currency
  };
}

export class BudgetDatabase {
  // Get all budgets for the current user
  static async getBudgets(): Promise<Budget[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(dbBudgetToBudget);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw new Error('Failed to fetch budgets');
    }
  }

  // Get budgets for a specific month
  static async getBudgetsForMonth(month: string): Promise<Budget[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month);

      if (error) {
        throw error;
      }

      return data.map(dbBudgetToBudget);
    } catch (error) {
      console.error('Error fetching budgets for month:', error);
      throw new Error('Failed to fetch budgets for month');
    }
  }

  // Add or update a budget
  static async setBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbBudget = budgetToDbBudget(budget, user.id);

      const { data, error } = await supabase
        .from('budgets')
        .upsert([dbBudget], { 
          onConflict: 'user_id,category,month',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return dbBudgetToBudget(data);
    } catch (error) {
      console.error('Error setting budget:', error);
      throw new Error('Failed to set budget');
    }
  }

  // Delete a budget
  static async deleteBudget(budgetId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw new Error('Failed to delete budget');
    }
  }

  // Delete all budgets for the current user
  static async deleteAllBudgets(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting all budgets:', error);
      throw new Error('Failed to delete all budgets');
    }
  }
}
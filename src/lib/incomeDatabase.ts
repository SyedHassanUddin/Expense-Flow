import { supabase } from './supabase';
import { Income } from '../types/income';

export interface DatabaseIncome {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  date: string;
  currency: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  created_at: string;
  updated_at: string;
}

// Convert database income to app income format
function dbIncomeToIncome(dbIncome: DatabaseIncome): Income {
  return {
    id: dbIncome.id,
    amount: dbIncome.amount,
    source: dbIncome.source,
    date: dbIncome.date,
    currency: dbIncome.currency,
    is_recurring: dbIncome.is_recurring,
    recurring_frequency: dbIncome.recurring_frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
  };
}

// Convert app income to database format
function incomeToDbIncome(income: Omit<Income, 'id'>, userId: string): Omit<DatabaseIncome, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    amount: income.amount,
    source: income.source,
    date: income.date,
    currency: income.currency,
    is_recurring: income.is_recurring || false,
    recurring_frequency: income.recurring_frequency
  };
}

export class IncomeDatabase {
  // Get all income for the current user
  static async getIncome(): Promise<Income[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(dbIncomeToIncome);
    } catch (error) {
      console.error('Error fetching income:', error);
      throw new Error('Failed to fetch income');
    }
  }

  // Add a new income entry
  static async addIncome(income: Omit<Income, 'id'>): Promise<Income> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const dbIncome = incomeToDbIncome(income, user.id);

      const { data, error } = await supabase
        .from('income')
        .insert([dbIncome])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return dbIncomeToIncome(data);
    } catch (error) {
      console.error('Error adding income:', error);
      throw new Error('Failed to add income');
    }
  }

  // Update an existing income entry
  static async updateIncome(income: Income): Promise<Income> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('income')
        .update({
          amount: income.amount,
          source: income.source,
          date: income.date,
          currency: income.currency,
          is_recurring: income.is_recurring || false,
          recurring_frequency: income.recurring_frequency
        })
        .eq('id', income.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return dbIncomeToIncome(data);
    } catch (error) {
      console.error('Error updating income:', error);
      throw new Error('Failed to update income');
    }
  }

  // Delete an income entry
  static async deleteIncome(incomeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', incomeId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      throw new Error('Failed to delete income');
    }
  }

  // Delete all income for the current user
  static async deleteAllIncome(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('income')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting all income:', error);
      throw new Error('Failed to delete all income');
    }
  }
}
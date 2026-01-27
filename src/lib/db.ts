import { supabase } from './supabaseClient';

export interface BudgetItem {
  category: string;
  planned: number;
  actual: number;
}

export interface BudgetRow {
  id: string;
  user_id: string;
  title: string;
  month: string; // ISO date string (e.g., 2025-09-01)
  items: BudgetItem[];
  created_at: string;
  updated_at: string;
}

export async function listBudgets(): Promise<BudgetRow[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('month', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBudget(id: string): Promise<BudgetRow | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createBudget(params: { title: string; month: string; items?: BudgetItem[] }): Promise<BudgetRow> {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to create budget');
  }
  
  const { data, error } = await supabase
    .from('budgets')
    .insert({ 
      title: params.title, 
      month: params.month, 
      items: params.items ?? [],
      user_id: user.id 
    })
    .select()
    .single();
  if (error) throw error;
  return data as BudgetRow;
}

export async function updateBudget(id: string, updates: Partial<Pick<BudgetRow, 'title' | 'month' | 'items'>>): Promise<BudgetRow> {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BudgetRow;
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
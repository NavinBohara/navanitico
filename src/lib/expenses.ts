import { supabase } from './supabaseClient';

export type ExpenseCategory =
  | 'Food'
  | 'Rent'
  | 'Transport'
  | 'Bills'
  | 'EMI'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Education'
  | 'Travel'
  | 'Misc';

export interface ExpenseRow {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  note: string | null;
  date: string; // ISO date (yyyy-mm-dd)
  created_at: string;
}

export interface CreateExpenseParams {
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date
  note?: string;
}

export interface UpdateExpenseParams {
  amount?: number;
  category?: ExpenseCategory;
  date?: string; // ISO date
  note?: string | null;
}

export async function addExpense(params: CreateExpenseParams): Promise<ExpenseRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      amount: params.amount,
      category: params.category,
      note: params.note ?? null,
      date: params.date
    })
    .select()
    .single();

  if (error) throw error;
  return data as ExpenseRow;
}

export async function listExpensesByMonth(year: number, monthZeroBased: number): Promise<ExpenseRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const start = new Date(year, monthZeroBased, 1);
  const end = new Date(year, monthZeroBased + 1, 0);
  const startIso = start.toISOString().slice(0, 10);
  const endIso = end.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startIso)
    .lte('date', endIso)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ExpenseRow[];
}

export async function updateExpense(id: string, updates: UpdateExpenseParams): Promise<ExpenseRow> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ExpenseRow;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function summarizeMonth(year: number, monthZeroBased: number): Promise<{ total: number; byCategory: Record<ExpenseCategory, number> }>{
  const rows = await listExpensesByMonth(year, monthZeroBased);
  const byCategory = rows.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return { total, byCategory };
}



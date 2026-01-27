import { supabase } from './supabaseClient';

export interface ProfileRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId: string, fields: Partial<Pick<ProfileRow, 'name' | 'avatar_url'>>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields })
    .select()
    .single();
  if (error) throw error;
}
import { supabase } from './supabaseClient';

// Saved Articles
export interface SavedArticleRow {
  id: string;
  user_id: string;
  article_id: string;
  title: string | null;
  url: string | null;
  image_url: string | null;
  created_at: string;
}

export async function addSavedArticle(article: { article_id: string; title?: string; url?: string; image_url?: string; }): Promise<void> {
  const { error } = await supabase
    .from('saved_articles')
    .insert({
      article_id: article.article_id,
      title: article.title ?? null,
      url: article.url ?? null,
      image_url: article.image_url ?? null
    });
  if (error) throw error;
}

export async function listSavedArticles(): Promise<SavedArticleRow[]> {
  const { data, error } = await supabase
    .from('saved_articles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function removeSavedArticle(article_id: string): Promise<void> {
  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('article_id', article_id);
  if (error) throw error;
}

// Module Progress
export interface ModuleProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  completed_at: string;
}

export async function markModuleCompleted(module_id: string): Promise<void> {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to mark module completed');
  }
  
  const { error } = await supabase
    .from('module_progress')
    .insert({ user_id: user.id, module_id });
  if (error) throw error;
}

export async function listCompletedModules(): Promise<string[]> {
  const { data, error } = await supabase
    .from('module_progress')
    .select('module_id');
  if (error) throw error;
  return (data ?? []).map((r: any) => r.module_id as string);
}

// Game Progress
export interface GameProgressRow {
  user_id: string;
  level: number;
  score: number;
  coins: number;
  updated_at: string;
}

export async function upsertGameProgress(level: number, score: number, coins: number): Promise<void> {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to update game progress');
  }
  
  const { error } = await supabase
    .from('game_progress')
    .upsert({ user_id: user.id, level, score, coins })
    .select()
    .single();
  if (error) throw error;
}

export async function getGameProgress(): Promise<Pick<GameProgressRow, 'level' | 'score' | 'coins'> | null> {
  const { data, error } = await supabase
    .from('game_progress')
    .select('level, score, coins')
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
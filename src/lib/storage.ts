import { supabase } from './supabaseClient';

const BUCKET = 'public-files';

export async function uploadUserFile(userId: string, file: File): Promise<{ path: string }> {
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  return { path: filePath };
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
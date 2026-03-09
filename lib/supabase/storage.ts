import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

/** Get singleton Supabase client for storage operations only */
export function getSupabaseStorage() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables are not defined');
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

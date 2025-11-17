// Re-export shared lib utilities if needed
// Currently auth is in features/auth

// Supabase 클라이언트 re-export
export {
  supabase,
  checkSupabaseSession,
  getSupabaseUser,
  onAuthStateChange,
  createServerClient,
  supabaseUrl,
  supabasePublishableKey,
} from './supabase';
export type { Database } from './supabase';


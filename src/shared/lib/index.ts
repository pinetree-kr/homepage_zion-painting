// Re-export shared lib utilities if needed
// Currently auth is in features/auth

export { 
  supabase, 
  createServerClient,
  checkSupabaseSession,
  getSupabaseUser,
  onAuthStateChange
} from './supabase';
export type { Database } from './supabase';


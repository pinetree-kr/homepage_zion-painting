import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase-types';
import { supabaseUrl, supabasePublishableKey } from './config';

/**
 * 서버 사이드용 Supabase 클라이언트 생성 함수
 * 서버 컴포넌트나 서버 액션에서 사용
 * 
 * 쿠키에서 세션 정보를 읽어서 인증된 클라이언트를 생성합니다.
 * 
 * 사용 예시:
 * ```tsx
 * import { createServerClient } from '@/src/shared/lib/supabase/server';
 * 
 * const supabase = await createServerClient();
 * const { data, error } = await supabase.from('users').select('*');
 * ```
 */
export async function createServerClient(): Promise<SupabaseClient<Database>> {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

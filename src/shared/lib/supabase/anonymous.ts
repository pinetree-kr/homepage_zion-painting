import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../supabase-types';
import { supabaseUrl, supabasePublishableKey } from './config';

/**
 * 익명 Supabase 클라이언트 생성 함수
 * 인증이 필요 없는 공개 데이터를 가져올 때 사용
 * 빌드 타임에도 사용 가능합니다.
 * 
 * 사용 예시:
 * ```tsx
 * import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
 * 
 * const supabase = createAnonymousServerClient();
 * const { data, error } = await supabase.from('public_data').select('*');
 * ```
 */
export function createAnonymousServerClient(): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabasePublishableKey);
}


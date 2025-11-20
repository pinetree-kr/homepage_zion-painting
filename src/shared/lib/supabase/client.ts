'use client';

import { createBrowserClient as createClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase-types';
import { supabaseUrl, supabasePublishableKey } from './config';

/**
 * 클라이언트 사이드용 Supabase 클라이언트
 * 
 * 브라우저에서 사용하는 싱글톤 인스턴스
 * 
 * 사용 예시:
 * ```tsx
 * 'use client';
 * import { supabase } from '@/src/shared/lib/supabase/client';
 * 
 * const { data, error } = await supabase.from('users').select('*');
 * ```
 */

// 브라우저 환경 체크 헬퍼
const isBrowser = typeof window !== 'undefined';

export function createSupabaseClient() {
  const client = createClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return client;
}

// 브라우저 환경에서만 초기화
export const supabase: SupabaseClient<Database> = createSupabaseClient()

/**
 * 현재 Supabase 세션 확인
 * 클라이언트 사이드에서 사용
 * 
 * @returns 세션이 있으면 true, 없으면 false
 */
export async function checkSupabaseSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('세션 확인 오류:', error);
      return false;
    }
    return !!session;
  } catch (error) {
    console.error('세션 확인 중 예외 발생:', error);
    return false;
  }
}

/**
 * 현재 Supabase 사용자 정보 가져오기
 * 클라이언트 사이드에서 사용
 * 
 * @returns 사용자 정보 또는 null
 */
export async function getSupabaseUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('사용자 정보 가져오기 중 예외 발생:', error);
    return null;
  }
}

/**
 * Supabase 인증 상태 변경 리스너 설정
 * 클라이언트 사이드에서 사용
 * 
 * @param callback 인증 상태 변경 시 호출될 콜백 함수
 * @returns 리스너 제거 함수
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}


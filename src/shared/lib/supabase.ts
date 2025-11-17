import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 확인하세요.'
  );
}

/**
 * 클라이언트 사이드용 Supabase 클라이언트
 * 
 * 사용 예시:
 * ```tsx
 * 'use client';
 * import { supabase } from '@/src/shared/lib';
 * 
 * const { data, error } = await supabase.from('users').select('*');
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * 서버 사이드용 Supabase 클라이언트 생성 함수
 * 서버 컴포넌트나 API 라우트에서 사용
 * 
 * 사용 예시:
 * ```tsx
 * import { createServerClient } from '@/src/shared/lib';
 * 
 * const supabase = createServerClient();
 * const { data, error } = await supabase.from('users').select('*');
 * ```
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

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


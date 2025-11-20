'use client';

// import { useMemo } from 'react';
import { createBrowserClient as createClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '../supabase-types';
import { supabaseUrl, supabasePublishableKey } from './config';

/**
 * 클라이언트 사이드용 Supabase 클라이언트
 * 
 */

export function createBrowserClient(): SupabaseClient<Database> {
  console.log('createBrowserClient', {
    supabaseUrl,
    supabasePublishableKey,
  });
  return createClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
  );
}

export const supabaseClient = createBrowserClient();

/**
 * 현재 Supabase 세션 확인
 * 클라이언트 사이드에서 사용
 * 
 * @deprecated useSupabase hook을 사용하세요
 * @returns 세션이 있으면 true, 없으면 false
 */
export async function checkSupabaseSession(client?: SupabaseClient<Database>): Promise<boolean> {
  const _client = client || createBrowserClient();
  try {
    const { data: { session }, error } = await _client.auth.getSession();
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
 * Hook을 사용하는 버전으로 업데이트 권장
 * 
 * @returns 사용자 정보 또는 null
 */
// export async function getSupabaseUser(client?: SupabaseClient<Database>) {
//   try {
//     const _client = client || createBrowserClient();
//     const { data: { user }, error } = await _client.auth.getUser();
//     if (error) {
//       console.error('사용자 정보 가져오기 오류:', error);
//       return null;
//     }
//     return user;
//   } catch (error) {
//     console.error('사용자 정보 가져오기 중 예외 발생:', error);
//     return null;
//   }
// }

export async function getSupabaseUser(): Promise<User | null> {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
  return user;
}

/**
 * Supabase 인증 상태 변경 리스너 설정
 * Hook을 사용하는 버전으로 업데이트 권장
 * 
 * @param callback 인증 상태 변경 시 호출될 콜백 함수
 * @returns 리스너 제거 함수
 */
// export function onAuthStateChange(callback: (event: string, session: any) => void, client?: SupabaseClient<Database>) {
//   try {
//     const _client = client || createBrowserClient();
//     return _client.auth.onAuthStateChange(callback);
//   } catch (error) {
//     // 서버 사이드에서는 더미 리스너 반환
//     return { data: { subscription: { unsubscribe: () => { } } } };
//   }
// }

export function onAuthStateChange(callback: (event: string, session: Session | null) => void, client?: SupabaseClient<Database>) {
  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(callback);
  return () => {
    subscription.unsubscribe();
  };
}




// interface SupabaseContextType {
//   supabase: SupabaseClient
// }

// const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// type SupabaseProviderProps = {
//   children: React.ReactNode
// }

// export function SupabaseProvider({ children }: SupabaseProviderProps) {
//   const supabase = createBrowserClient();
//   return (
//     <SupabaseContext.Provider value={{ supabase }
//     }>
//       {children}
//     </SupabaseContext.Provider>
//   )
// }

// export function useSupabase() {
//   const context = useContext(SupabaseContext)
//   if (context === undefined) {
//     throw new Error('useSupabase must be used within a SupabaseProvider')
//   }
//   return context.supabase
// }

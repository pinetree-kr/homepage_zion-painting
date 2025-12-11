import { createServerClient as createClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '../supabase-types';
import { supabaseUrl, supabasePublishableKey, supabaseProjectId } from './config';

/**
 * 미들웨어용 Supabase 클라이언트 생성 함수
 * Edge Runtime에서 사용 가능
 * 
 * @param request NextRequest 객체
 * @param response NextResponse 객체 (쿠키 설정용)
 * @returns Supabase 클라이언트
 */
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(cookie => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // 쿠키 설정
          if (supabaseProjectId) {
            if (name === supabaseProjectId) {
              response.cookies.set(name, value, options);
            }
          } else {
            if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
              response.cookies.set(name, value, options);
            }
          }
        });
      },
    },
  });
}


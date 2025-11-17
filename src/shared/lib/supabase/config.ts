/**
 * Supabase 공통 설정
 */

// 환경 변수에서 Supabase 설정 가져오기
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 확인하세요.'
  );
}


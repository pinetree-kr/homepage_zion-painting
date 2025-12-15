/**
 * Supabase 공통 설정
 */

// 환경 변수에서 Supabase 설정 가져오기
export const supabaseProjectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

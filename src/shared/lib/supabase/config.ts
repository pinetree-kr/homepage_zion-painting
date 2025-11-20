/**
 * Supabase 공통 설정
 */

// 환경 변수에서 Supabase 설정 가져오기
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// // 환경 변수 검증 (개발 환경에서만 경고)
// if (typeof window !== 'undefined' && (!supabaseUrl || !supabasePublishableKey)) {
//   console.error(
//     '❌ Supabase 환경 변수가 설정되지 않았습니다!\n' +
//     'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 확인하세요.\n' +
//     `현재 값: URL=${supabaseUrl ? '설정됨' : '없음'}, KEY=${supabasePublishableKey ? '설정됨' : '없음'}`
//   );
// }


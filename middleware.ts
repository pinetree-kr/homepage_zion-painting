import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/src/shared/lib/supabase/middleware';
import { CURRENT_TERMS_VERSION_DB } from '@/src/shared/lib/auth';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 약관 동의 페이지, 인증 관련 페이지, API, 정적 파일은 제외
  const pathname = request.nextUrl.pathname;
  
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/logo-') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return response;
  }

  // Supabase 클라이언트 생성
  const supabase = createMiddlewareClient(request, response);
  
  // 세션 확인
  const { data: { session } } = await supabase.auth.getSession();

  // 로그인하지 않은 사용자는 통과
  if (!session) {
    return response;
  }

  // 관리자 여부 확인 (관리자는 약관 동의 불필요)
//   const { data: adminData } = await supabase
//     .from('administrators')
//     .select('id')
//     .eq('id', session.user.id)
//     .is('deleted_at', null)
//     .maybeSingle();

//   if (adminData) {
//     return response; // 관리자는 통과
//   }

  // JWT user_metadata에서 약관 동의 확인 (네트워크 요청 없음)
  const metadata = session.user.user_metadata || {};
  const termsAgreed = metadata.terms_agreed === true;
  const privacyAgreed = metadata.privacy_agreed === true;
  const termsVersion = metadata.terms_agreed_version;

  // 약관 동의가 안 되어 있거나 버전이 다르면 약관 동의 페이지로 리다이렉트
  if (!termsAgreed || !privacyAgreed || termsVersion !== CURRENT_TERMS_VERSION_DB) {
    // 이미 약관 동의 페이지에 있으면 리다이렉트하지 않음 (무한 루프 방지)
    if (pathname !== '/auth/terms-agreement') {
      const url = new URL('/auth/terms-agreement', request.url);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import { recordAdminLogin, recordLoginFailed, signInWithGoogle, signInWithKakao } from '@/src/features/auth/api/auth-actions';
import { getClientIp } from '@/src/shared/lib/client-ip';
import Header from './Header';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  // URL 쿼리 파라미터에서 에러 메시지 읽기
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        google_auth_failed: '구글 로그인에 실패했습니다.',
        kakao_auth_failed: '카카오 로그인에 실패했습니다.',
        no_code: '인증 코드를 받지 못했습니다.',
        session_exchange_failed: '세션 생성에 실패했습니다.',
        no_user: '사용자 정보를 찾을 수 없습니다.',
        callback_error: '로그인 처리 중 오류가 발생했습니다.',
      };
      setError(errorMessages[errorParam] || '로그인 중 오류가 발생했습니다.');
      // 에러 메시지를 표시한 후 URL에서 제거
      router.replace('/auth/sign-in');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ipAddress = await getClientIp();
      // Supabase 로그인
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.code === 'invalid_credentials') {
          setError('이메일 또는 비밀번호가 올바르지 않습니다');
          // 로그인 실패 로그 기록
          try {

            await recordLoginFailed(email, ipAddress);
          } catch (logError) {
            console.error('로그인 실패 로그 기록 오류:', logError);
          }
        }
        else if (authError.code === 'email_not_confirmed') {
          // setError('이메일이 인증되지 않았습니다. 이메일을 확인해주세요.');
          router.push(`/auth/callback?email=${encodeURIComponent(email)}&error=email_not_confirmed`);
        }
        else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('로그인에 실패했습니다');
        setLoading(false);
        return;
      }

      // 로그인 성공 시 last_login 업데이트 (metadata에 저장)
      const { data: currentProfile } = await supabaseClient
        .from('profiles')
        .select('metadata')
        .eq('id', authData.user.id)
        .single();

      if (currentProfile) {
        const updatedMetadata = {
          ...(currentProfile.metadata as object || {}),
          last_login: new Date().toISOString()
        };

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ metadata: updatedMetadata })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('last_login 업데이트 실패:', updateError);
        }
      }

      // administrators 테이블에서 관리자 여부 확인
      const { data: adminData } = await supabaseClient
        .from('administrators')
        .select('id')
        .eq('id', authData.user.id)
        .is('deleted_at', null)
        .maybeSingle();

      const isAdmin = adminData !== null;

      // 관리자인 경우 관리자 로그인 로그 기록
      if (isAdmin) {
        try {
          await recordAdminLogin(ipAddress);
        } catch (logError) {
          console.error('관리자 로그인 로그 기록 오류:', logError);
          // 로그 기록 실패해도 로그인은 계속 진행
        }
      }

      // 약관 동의 확인은 미들웨어에서 처리됨
      // 관리자인 경우 관리자 페이지로, 아니면 홈으로
      if (isAdmin) {
        // router.push('/admin');
        router.push('/');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      console.error('로그인 중 오류 발생:', err);
      setError('로그인 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const { url, nonce } = await signInWithGoogle({
        redirectUri: `${window.location.origin}/auth/callback/google`
      });

      // state를 sessionStorage에 저장 (콜백에서 검증용)
      sessionStorage.setItem('google_oauth_nonce', nonce);

      // 구글 인증 페이지로 리다이렉트
      window.location.href = url;
    } catch (err) {
      console.error('구글 로그인 중 오류 발생:', err);
      setError('구글 로그인 중 오류가 발생했습니다');
      setGoogleLoading(false);
    }
  };

  const handleKakaoSignIn = async () => {
    setError('');
    setKakaoLoading(true);

    try {
      const { url, nonce } = await signInWithKakao({
        redirectUri: `${window.location.origin}/auth/callback/kakao`
      });

      // state를 sessionStorage에 저장 (콜백에서 검증용)
      sessionStorage.setItem('kakao_oauth_nonce', nonce);

      // 카카오 인증 페이지로 리다이렉트
      window.location.href = url;
    } catch (err) {
      console.error('카카오 로그인 중 오류 발생:', err);
      setError('카카오 로그인 중 오류가 발생했습니다');
      setKakaoLoading(false);
    }
  };

  return (
    <>

      {/* <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>돌아가기</span>
      </Link> */}

      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-gray-900 text-2xl font-bold mb-2">로그인</h2>
          <p className="text-gray-600">이메일과 비밀번호를 입력하세요</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">이메일</Label>
            <div className="relative mt-1">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative mt-1">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="최소 8자 이상"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-600 leading-none cursor-pointer"
              >
                기억하기
              </label>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-teal-600 hover:text-teal-700">
              비밀번호 찾기
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? '로그인 중...' : '로그인'}
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading || kakaoLoading}
            className="mt-6 w-full h-10 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 border border-gray-300 rounded-md px-4 py-2 flex items-center justify-center gap-3 transition-colors"
          >
            {googleLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>구글 로그인 중...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>구글로 로그인</span>
              </>
            )}
          </button>

          <div className="mt-3 relative">
            <button
              type="button"
              onClick={handleKakaoSignIn}
              disabled={true}
              title="카카오 로그인은 준비 중입니다"
              className="w-full h-10 bg-[#FEE500]/50 hover:bg-[#FEE500]/50 disabled:bg-[#FEE500]/50 disabled:cursor-not-allowed text-[#000000]/50 rounded-md px-4 py-2 flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
              </svg>
              <span>카카오로 로그인</span>
            </button>
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 text-xs px-2 py-0.5"
              title="카카오 로그인은 준비 중입니다"
            >
              예정
            </Badge>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            계정이 없으신가요?{' '}
            <Link href="/auth/sign-up" className="text-teal-600 hover:text-teal-700 font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>

    </>
  );
}

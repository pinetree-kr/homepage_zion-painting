'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import type { Profile } from '@/src/entities/user';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import { recordAdminLogin, recordLoginFailed } from '@/src/features/auth/api/auth-actions';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
            await recordLoginFailed(email);
          } catch (logError) {
            console.error('로그인 실패 로그 기록 오류:', logError);
          }
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

      // 로그인 성공 시 last_login 업데이트
      const { error: updateError } = await (supabaseClient
        .from('profiles'))
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('last_login 업데이트 실패:', updateError);
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
          await recordAdminLogin();
        } catch (logError) {
          console.error('관리자 로그인 로그 기록 오류:', logError);
          // 로그 기록 실패해도 로그인은 계속 진행
        }
      }

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

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>돌아가기</span>
      </Link>

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
            <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
              비밀번호 찾기
            </a>
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

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            계정이 없으신가요?{' '}
            <Link href="/auth/sign-up" className="text-teal-600 hover:text-teal-700 font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


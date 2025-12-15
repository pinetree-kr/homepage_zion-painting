'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { requestPasswordReset } from '@/src/features/auth/api/auth-actions';
import { toast } from 'sonner';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const redirectTo = `${window.location.origin}/auth/callback/set-password`;
      const result = await requestPasswordReset(email, redirectTo);

      if (!result.success) {
        setError(result.error || '비밀번호 재설정 이메일 발송에 실패했습니다.');
        toast.error(result.error || '비밀번호 재설정 이메일 발송에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 성공 (보안을 위해 계정이 없어도 성공 메시지 표시)
      setSuccess(true);
      toast.success('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
    } catch (err) {
      console.error('비밀번호 찾기 중 오류 발생:', err);
      const errorMessage = err instanceof Error ? err.message : '비밀번호 찾기 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (success) {
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
          <div className="mb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-gray-900 text-2xl font-bold mb-2">이메일을 확인해주세요</h2>
            <p className="text-gray-600">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
            </p>
            <p className="text-gray-600 mt-2">
              이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <p className="mb-2">이메일이 보이지 않나요?</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>스팸 폴더를 확인해주세요</li>
                <li>이메일 주소가 올바른지 확인해주세요</li>
                <li>몇 분 후 다시 시도해주세요</li>
              </ul>
            </div>

            <Link
              href="/auth/sign-in"
              className="block w-full text-center h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      <Link
        href="/auth/sign-in"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>돌아가기</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-gray-900 text-2xl font-bold mb-2">비밀번호 찾기</h2>
          <p className="text-gray-600">가입하신 이메일 주소를 입력해주세요</p>
          <p className="text-gray-500 text-sm mt-1">비밀번호 재설정 링크를 이메일로 보내드립니다</p>
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
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? '이메일 발송 중...' : '비밀번호 재설정 이메일 보내기'}
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            비밀번호를 기억하셨나요?{' '}
            <Link href="/auth/sign-in" className="text-teal-600 hover:text-teal-700 font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setPasswordWithToken } from '../api/auth-actions';
import { sendPasswordResetEmail } from '@/src/features/admin/user/api/admin-actions';
import { sendAdminInviteEmail } from '@/src/features/admin/user/api/admin-actions';
import { Input } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SetPasswordFormProps {
  token_hash: string;
  type: 'recovery' | 'invite';
  email?: string;
}

export default function SetPasswordForm({
  token_hash,
  type,
  email
}: SetPasswordFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'ready' | 'success' | 'error'>('ready');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(email || null);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const resendEmail = useCallback(async () => {
    const emailToUse = verifiedEmail || emailInput.trim();

    if (!emailToUse) {
      // 이메일이 없으면 입력 필드 표시
      setShowEmailInput(true);
      setError('이메일 주소를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    setError('');

    try {
      const redirectTo = `${window.location.origin}/auth/callback/set-password`;

      const result = await sendPasswordResetEmail(emailToUse, redirectTo);

      if (!result.success) {
        setError(result.error || '이메일 재발송에 실패했습니다.');
        toast.error(result.error || '이메일 재발송에 실패했습니다.');
        setIsResending(false);
        return;
      }

      setResendSuccess(true);
      setVerifiedEmail(emailToUse);
      setShowEmailInput(false);
      toast.success('이메일이 재발송되었습니다. 이메일을 확인해주세요.');
    } catch (err) {
      console.error('이메일 재발송 중 오류 발생:', err);
      const errorMessage = err instanceof Error ? err.message : '이메일 재발송 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  }, [verifiedEmail, emailInput, type]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다.';
    }

    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 패스워드 검증
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      // 토큰 검증 및 패스워드 설정 (저장 시점에 토큰 사용)
      const result = await setPasswordWithToken(token_hash, type, password);

      if (!result.success) {
        setError(result.error || '비밀번호 설정에 실패했습니다.');
        setLoading(false);
        return;
      }

      setStatus('success');

      // 타입에 따라 다른 경로로 리다이렉트
      setTimeout(() => {
        if (type === 'invite') {
          router.push('/admin');
        } else {
          router.push('/auth/sign-in');
        }
      }, 2000);
    } catch (err) {
      setError('비밀번호 설정 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };


  if (status === 'error') {
    return (
      <>
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h2>
              <p className="text-gray-600 mb-6">{error}</p>

              {resendSuccess ? (
                <div className="mb-4">
                  <p className="text-teal-800 text-sm">
                    이메일이 재발송되었습니다. 이메일을 확인해주세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifiedEmail && !showEmailInput && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        이메일: <span className="font-medium">{verifiedEmail}</span>
                      </p>
                    </div>
                  )}

                  {showEmailInput && (
                    <div className="space-y-2">
                      <Label htmlFor="resend-email">이메일 주소</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="w-full"
                      />
                    </div>
                  )}

                  <Button
                    onClick={resendEmail}
                    disabled={isResending}
                    className="bg-teal-500 hover:bg-teal-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isResending ? '재발송 중...' : '재발송'}
                  </Button>

                  {!verifiedEmail && !showEmailInput && (
                    <Button
                      onClick={() => setShowEmailInput(true)}
                      variant="outline"
                      className="w-full"
                    >
                      이메일 주소 입력
                    </Button>
                  )}
                </div>
              )}

              {/* <div className="mt-4 flex gap-4 justify-center">
                <Link
                  href="/auth/sign-in"
                  className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors"
                >
                  로그인 페이지로
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2">
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 설정 완료!</h2>
              <p className="text-gray-600 mb-6">
                {type === 'invite'
                  ? '관리자 계정이 활성화되었습니다. 잠시 후 관리자 페이지로 이동합니다.'
                  : '비밀번호가 성공적으로 설정되었습니다. 잠시 후 로그인 페이지로 이동합니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2">
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                {type === 'invite' ? (
                  <Shield className="h-8 w-8 text-teal-600" />
                ) : (
                  <Lock className="h-8 w-8 text-teal-600" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {type === 'invite' ? '관리자 초대 - 비밀번호 설정' : '비밀번호 재설정'}
            </h2>
            <p className="text-gray-600">
              {type === 'invite'
                ? '관리자 계정을 활성화하기 위해 비밀번호를 설정해주세요.'
                : '새로운 비밀번호를 입력해주세요.'}
            </p>
            {verifiedEmail && (
              <p className="text-sm text-gray-500 mt-2">이메일: {verifiedEmail}</p>
            )}
          </div>

          {/* 재발송 버튼 (인증 성공 상태에서도 사용 가능) */}
          {/* <div className="mb-4 flex justify-end">
            <Button
              type="button"
              onClick={resendEmail}
              disabled={isResending}
              variant="outline"
              className="text-sm"
            >
              {isResending ? '재발송 중...' : '재발송'}
            </Button>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                최소 8자 이상, 대문자, 소문자, 숫자 포함
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
                {/* 메일 재발송 버튼 */}
                <Button
                  onClick={resendEmail}
                  disabled={isResending}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isResending ? '재발송 중...' : '재발송'}
                </Button>
              </>
            )}

            {
              !error && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {loading ? '설정 중...' : '비밀번호 설정'}
                </Button>
              )
            }

          </form>

        </div>
        <div className="mt-6 text-center">
          <Link
            href="/auth/sign-in"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}


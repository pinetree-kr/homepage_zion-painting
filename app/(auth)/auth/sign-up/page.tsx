'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import { supabase } from '@/src/shared/lib/supabase/client';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { Dialog, DialogContent } from '@/src/shared/ui';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { checkEmailConfirmed, saveTermsAgreement } from '@/src/features/auth/api/auth-actions';
import { DialogTitle } from '@radix-ui/react-dialog';
import { CURRENT_TERMS_VERSION, CURRENT_TERMS_VERSION_DB } from '@/src/shared/lib/auth';
import { getClientIp } from '@/src/shared/lib/client-ip';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }

    if (!agreedToTerms) {
      setError('이용약관에 동의해주세요');
      return;
    }

    if (!agreedToPrivacy) {
      setError('개인정보 수집 및 이용에 동의해주세요');
      return;
    }

    setLoading(true);

    try {
      // Supabase 회원가입
      const supabase = createBrowserClient();

      const { success, error } = await checkEmailConfirmed(formData.email);

      // 이미 인증완료된 계정시
      if (success) {
        setError('이메일이 이미 사용중입니다.');
        setLoading(false);
        return;
      }

      // 인증완료되지 않은 계정시
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback/email`,
        },
      });

      if (authError) {
        setError(authError.message || '회원가입에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.');
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('회원가입에 실패했습니다');
        setLoading(false);
        return;
      }

      // 약관 동의 저장
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null;
      const ipAddress = await getClientIp()
      // 이용약관 동의 저장
      if (agreedToTerms) {
        const termsResult = await saveTermsAgreement(
          authData.user.id,
          'terms',
          CURRENT_TERMS_VERSION_DB,
          userAgent,
          ipAddress
        );
        if (!termsResult.success) {
          console.error('이용약관 동의 저장 실패:', termsResult.error);
        }
      }

      // 개인정보 수집 및 이용 동의 저장
      if (agreedToPrivacy) {
        const privacyResult = await saveTermsAgreement(
          authData.user.id,
          'privacy',
          CURRENT_TERMS_VERSION_DB,
          userAgent,
          ipAddress
        );
        if (!privacyResult.success) {
          console.error('개인정보 동의 저장 실패:', privacyResult.error);
        }
      }

      router.push(`/auth/callback?email=${encodeURIComponent(formData.email)}&requested=true`);

    } catch (err) {
      console.error('회원가입 중 오류 발생:', err);
      setError('회원가입 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-gray-900 text-2xl font-bold mb-2">회원가입</h2>
          <p className="text-gray-600">계정을 생성하세요</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <div className="relative mt-1">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="이름"
                className="pl-10"
                required
              />
            </div>
          </div>

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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="비밀번호"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
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
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="비밀번호 확인"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
                className="mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 leading-relaxed cursor-pointer flex-1"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setModalUrl(`/terms/${CURRENT_TERMS_VERSION}`);
                    setModalOpen(true);
                  }}
                  className="text-teal-600 hover:text-teal-700 underline"
                >
                  이용약관
                </button>
                에 동의합니다 (필수)
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={agreedToPrivacy}
                onCheckedChange={setAgreedToPrivacy}
                className="mt-0.5"
              />
              <label
                htmlFor="privacy"
                className="text-sm text-gray-600 leading-relaxed cursor-pointer flex-1"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setModalUrl(`/privacy/${CURRENT_TERMS_VERSION}`);
                    setModalOpen(true);
                  }}
                  className="text-teal-600 hover:text-teal-700 underline"
                >
                  개인정보 수집 및 이용
                </button>
                에 동의합니다 (필수)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-teal-500 hover:bg-gray-800 disabled:bg-teal-300 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors mt-8"
          >
            {loading ? '회원가입 중...' : '회원가입'}
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            계정이 있으신가요?{' '}
            <Link href="/auth/sign-in" className="text-teal-600 hover:text-teal-700 font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>

      {/* 약관 모달 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0">
          <div className="flex flex-col overflow-hidden">
            <DialogTitle>
            </DialogTitle>
            {modalUrl && (
              <iframe
                src={modalUrl + '?wrapped=false'}
                className="w-full h-full flex-1 border-0"
                title="약관 내용"
                style={{ minHeight: 0 }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


"use client";

import { Suspense, useCallback, useState } from 'react';
import Link from 'next/link';

import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from '@/src/shared/ui';

function WelcomeContent({ email, error }: { email: string, error?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isResending, setIsResending] = useState(false);

  const resendEmail = useCallback(async () => {
    setIsResending(true);
    try {
      const supabase = createBrowserClient();

      let emailToResend = email;
      if (!emailToResend) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          emailToResend = user.email;
        }
      }

      if (!emailToResend) {
        setModalTitle('오류');
        setModalMessage('이메일 주소를 찾을 수 없습니다.');
        setShowModal(true);
        setIsResending(false);
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToResend,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setModalTitle('재발송 실패');
        setModalMessage(error.message || '이메일 재발송에 실패했습니다.');
        setShowModal(true);
      } else {
        setModalTitle('재발송 완료');
        setModalMessage('이메일이 재발송되었습니다. 이메일을 확인해주세요.');
        setShowModal(true);
      }
    } catch (err) {
      console.error('이메일 재발송 중 오류 발생:', err);
      setModalTitle('오류');
      setModalMessage('이메일 재발송 중 오류가 발생했습니다.');
      setShowModal(true);
    } finally {
      setIsResending(false);
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2">
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {error === 'email_not_confirmed' ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증 필요</h2>
                <p className="text-sm text-gray-500 mb-6">
                  이메일이 인증되지 않았습니다. 이메일을 확인하고 인증 링크를 클릭해주세요.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">환영합니다!</h2>
                <p className="text-sm text-gray-500 mb-6">
                  회원가입 요청이 완료되었습니다. 이메일을 확인하고 인증 링크를 클릭해주세요.
                </p>
              </>
            )}

            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/sign-in"
                className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors"
              >
                로그인 페이지로 돌아가기
              </Link>
              <button
                onClick={resendEmail}
                disabled={isResending}
                className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                {isResending ? '재발송 중...' : '이메일 재발송'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            메인으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 모달 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              {modalMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Welcome({ email, error }: { email: string, error?: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">로딩 중...</h2>
                <p className="text-gray-600">페이지를 불러오는 중입니다.</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <WelcomeContent email={email} error={error} />
    </Suspense>
  );
}


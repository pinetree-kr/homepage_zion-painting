'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { verifyEmail } from '@/app/lib/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const verified = searchParams.get('verified');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 회원가입 후 이메일 인증 대기 상태
    if (verified === 'false') {
      setStatus('pending');
      setMessage('이메일 인증 링크를 확인해주세요. 이메일을 발송했습니다.');
      return;
    }

    // 이메일 인증 콜백 처리
    if (email && token) {
      const success = verifyEmail(email, token);
      if (success) {
        setStatus('success');
        setMessage('이메일 인증이 완료되었습니다. 잠시 후 메인 페이지로 이동합니다.');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 3000);
      } else {
        setStatus('error');
        setMessage('이메일 인증에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다.');
      }
    } else {
      setStatus('error');
      setMessage('잘못된 접근입니다.');
    }
  }, [email, token, verified, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-lg">
              <Image
                src="/logo-192.png"
                alt="시온"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {status === 'loading' && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">처리 중...</h2>
              <p className="text-gray-600">이메일 인증을 확인하고 있습니다.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">인증 완료!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
              >
                메인으로 이동
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">인증 실패</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/auth/sign-in"
                  className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
                >
                  다시 가입
                </Link>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 확인 필요</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500 mb-6">
                이메일을 확인하고 인증 링크를 클릭해주세요.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/auth/sign-in"
                  className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors"
                >
                  로그인
                </Link>
                <button
                  onClick={() => {
                    // 이메일 재발송 로직 (실제로는 서버 API 호출)
                    alert('이메일이 재발송되었습니다.');
                  }}
                  className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
                >
                  이메일 재발송
                </button>
              </div>
            </div>
          )}
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
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-lg">
                  <Image
                    src="/logo-192.png"
                    alt="시온"
                    width={80}
                    height={80}
                    className="h-20 w-auto"
                  />
                </div>
              </div>
            </div>
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
      <CallbackContent />
    </Suspense>
  );
}


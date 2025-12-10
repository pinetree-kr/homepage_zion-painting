'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createBrowserClient } from '@/src/shared/lib/supabase/client';

interface VerifyEmailTokenProps {
    accessToken: string;
    idToken: string;
}

function VerifyEmailTokenContent({ accessToken, idToken }: VerifyEmailTokenProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    const signInWithGoogle = useCallback(async (idToken: string) => {
        const supabase = createBrowserClient();
        console.log('accessToken', idToken);
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });
        console.log('data', data);
        console.log('error', error);
        if (error) {
            setStatus('error');
            setMessage(error.message || '토큰이 만료되었거나 유효하지 않습니다.');
            return;
        }
        if (data.user) {
            setStatus('success');
            setMessage('잠시 후 메인 페이지로 이동합니다.');
            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 1000);
        }
    }, [router]);


    useEffect(() => {
        if (idToken) {
            signInWithGoogle(idToken);
        }
    }, [idToken, signInWithGoogle]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2">
            <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    {status === 'loading' && (
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">처리 중...</h2>
                            <p className="text-gray-600">사용자 인증을 확인하고 있습니다.</p>
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
                            <p className="text-gray-600 mb-6">{message}</p>
                            <Link
                                href="/"
                                className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 실패</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/auth/sign-in"
                                    className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/auth/sign-up"
                                    className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
                                >
                                    가입하기
                                </Link>
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

export default function VerifyEmailToken({ accessToken, idToken }: VerifyEmailTokenProps) {
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
            <VerifyEmailTokenContent accessToken={accessToken} idToken={idToken} />
        </Suspense>
    );
}


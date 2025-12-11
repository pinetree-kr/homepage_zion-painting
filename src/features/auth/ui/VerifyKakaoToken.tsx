'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { verifyKakaoTokenAndCreateSession } from '@/src/features/auth/api/auth-actions';

interface VerifyKakaoTokenProps {
    accessToken: string;
    idToken: string;
}

function VerifyKakaoTokenContent({ accessToken, idToken }: VerifyKakaoTokenProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    const signInWithKakao = useCallback(async (accessToken: string) => {
        const supabase = createBrowserClient();

        try {
            // 서버 액션으로 카카오 토큰 검증 및 사용자 생성/찾기
            const result = await verifyKakaoTokenAndCreateSession(accessToken);

            if (!result.success || !result.userId) {
                setStatus('error');
                setMessage(result.error || '카카오 로그인에 실패했습니다.');
                return;
            }

            const userId = result.userId;
            const sessionToken = result.sessionToken;

            // 세션 토큰이 있으면 마법 링크를 사용하여 세션 생성
            if (sessionToken) {
                // 마법 링크에서 토큰 해시 추출
                let tokenHash = sessionToken;
                if (sessionToken.includes('token_hash=')) {
                    const url = new URL(sessionToken);
                    tokenHash = url.searchParams.get('token_hash') || url.hash.split('token_hash=')[1]?.split('&')[0] || sessionToken;
                }

                // 마법 링크 토큰으로 세션 생성
                const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                    token_hash: tokenHash,
                    type: 'magiclink',
                });

                if (verifyError || !verifyData.user) {
                    setStatus('error');
                    setMessage(verifyError?.message || '세션 생성에 실패했습니다.');
                    return;
                }

                // // 관리자 여부 확인
                // const { data: adminData } = await supabase
                //     .from('administrators')
                //     .select('id')
                //     .eq('id', verifyData.user.id)
                //     .is('deleted_at', null)
                //     .maybeSingle();

                // const isAdmin = adminData !== null;

                // // 관리자가 아니면 약관 동의 페이지로 리디렉션
                // if (!isAdmin) {
                //     router.push('/auth/terms-agreement');
                //     router.refresh();
                //     return;
                // } else {
                setStatus('success');
                setMessage('잠시 후 메인 페이지로 이동합니다.');
                setTimeout(() => {
                    router.push('/');
                    router.refresh();
                }, 1000);
                // }
            } else {
                setStatus('error');
                setMessage('세션 토큰을 받지 못했습니다.');
            }

        } catch (error) {
            console.error('카카오 로그인 오류:', error);
            setStatus('error');
            setMessage(error instanceof Error ? error.message : '카카오 로그인 중 오류가 발생했습니다.');
        }
    }, [router]);

    useEffect(() => {
        if (idToken) {
            signInWithKakao(idToken);
        }
    }, [idToken, signInWithKakao]);

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

export default function VerifyKakaoToken({ accessToken, idToken }: VerifyKakaoTokenProps) {
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
            <VerifyKakaoTokenContent accessToken={accessToken} idToken={idToken} />
        </Suspense>
    );
}


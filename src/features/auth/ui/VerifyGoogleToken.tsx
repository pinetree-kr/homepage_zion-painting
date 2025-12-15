'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { updateGoogleUserProfileAfterLogin, checkGoogleAccountConflict } from '@/src/features/auth/api/auth-actions';

interface VerifyEmailTokenProps {
    accessToken: string;
    idToken: string;
}

function VerifyEmailTokenContent({ accessToken, idToken }: VerifyEmailTokenProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [mode, setMode] = useState<'linking' | 'login'>('login');
    const [message, setMessage] = useState('');

    const signInWithGoogle = useCallback(async (accessToken: string, idToken: string) => {
        const supabase = createBrowserClient();

        // URL에서 link_user_id 파라미터 확인 (AccountLinkingForm에서 전달)
        const urlParams = new URLSearchParams(window.location.search);

        const { linkUserId } = JSON.parse(urlParams.get('state') || '{}');
        console.log({ linkUserId })

        // 1. linkUserId가 있는 경우: 연동 프로세스만 진행 (로그인 없이)
        if (linkUserId) {
            setMode('linking');
            // accessToken으로 구글 사용자 정보 가져오기 (이메일 확인)
            let googleEmail: string | null = null;
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (userInfoResponse.ok) {
                    const userInfo = await userInfoResponse.json() as {
                        id: string;
                        email: string;
                        name: string;
                        picture?: string;
                        verified_email: boolean;
                    };
                    googleEmail = userInfo.email;
                } else {
                    setStatus('error');
                    setMessage('구글 사용자 정보를 가져올 수 없습니다.');
                    return;
                }
            } catch (error) {
                console.error('구글 사용자 정보 가져오기 실패:', error);
                setStatus('error');
                setMessage('구글 사용자 정보를 가져오는 중 오류가 발생했습니다.');
                return;
            }

            if (!googleEmail) {
                setStatus('error');
                setMessage('구글 이메일 정보를 가져올 수 없습니다.');
                return;
            }

            // 중복 체크
            const conflictCheck = await checkGoogleAccountConflict(googleEmail, linkUserId);

            if (conflictCheck.hasConflict) {
                setStatus('error');
                setMessage('이 구글 계정은 이미 다른 계정에 연결되어 있습니다. 다른 구글 계정을 사용해주세요.');
                return;
            }

            // 연동 프로세스 진행 (로그인 없이)
            const updateResult = await updateGoogleUserProfileAfterLogin(linkUserId, googleEmail);

            if (!updateResult.success) {
                setStatus('error');
                setMessage(updateResult.error || '계정 연동에 실패했습니다.');
                return;
            }

            // 연동 성공
            setStatus('success');
            setMessage('계정 연동이 완료되었습니다. 잠시 후 프로필 페이지로 이동합니다.');
            setTimeout(() => {
                router.push('/mypage/profile');
                router.refresh();
            }, 1000);
            return;
        }

        // 2. linkUserId가 없는 경우: 로그인 프로세스 진행
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });

        if (error) {
            setStatus('error');
            setMessage(error.message || '토큰이 만료되었거나 유효하지 않습니다.');
            return;
        }

        if (data.user) {
            const googleUserId = data.user.id;
            const googleEmail = data.user.email;

            // 로그인 후 프로필 업데이트
            const updateResult = await updateGoogleUserProfileAfterLogin(googleUserId, googleEmail || undefined);

            if (!updateResult.success) {
                setStatus('error');
                setMessage(updateResult.error || '로그인 처리에 실패했습니다.');
                return;
            }

            // 로그인 성공
            setStatus('success');
            setMessage('잠시 후 메인 페이지로 이동합니다.');
            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 1000);
        }
    }, [router]);


    useEffect(() => {
        if (idToken && accessToken) {
            signInWithGoogle(accessToken, idToken);
        }
    }, [idToken, accessToken, signInWithGoogle]);

    return (
        <>
            <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{mode === 'linking' ? '계정 연동' : '로그인'} 실패</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            {
                                mode === 'login' && (
                                    <div className="flex gap-4 justify-center">

                                        <Link
                                            href='/auth/sign-in'
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
                                )
                            }
                        </div>
                    )}

                </div>

                <div className="mt-6 text-center">
                    <Link
                        href={mode === 'linking' ? '/mypage/profile' : '/'}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {mode === 'linking' ? '프로필' : '메인'} 페이지로 돌아가기
                    </Link>
                </div>
            </div>
        </>
    );
}

export default function VerifyEmailToken({ accessToken, idToken }: VerifyEmailTokenProps) {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">로딩 중...</h2>
                            <p className="text-gray-600">페이지를 불러오는 중입니다.</p>
                        </div>
                    </div>
                </div>
            }
        >
            <VerifyEmailTokenContent accessToken={accessToken} idToken={idToken} />
        </Suspense>
    );
}


'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from '@/src/shared/ui';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { verifyTokenHash } from '../api/auth-actions';
import { MailIcon } from 'lucide-react';

interface VerifyEmailTokenProps {
    token_hash: string;
    email: string;
}

function VerifyEmailTokenContent({ email, token_hash }: VerifyEmailTokenProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [isResending, setIsResending] = useState(false);

    const resendEmail = useCallback(async () => {
        setIsResending(true);
        try {
            const supabase = createBrowserClient();

            // 이메일 주소 가져오기: searchParams에서 먼저 시도, 없으면 현재 세션에서 가져오기
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

            console.log({ emailRedirectTo: `${window.location.origin}/auth/callback`, })

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

    useEffect(() => {
        if (token_hash) {
            verifyTokenHash(token_hash, 'signup').then(async ({ success, error, data }) => {
                // 회원가입 후 이메일 인증 대기 상태
                if (!success || error) {
                    setStatus('pending');
                    setMessage('링크가 만료되었거나 유효하지 않습니다.');
                    return;
                }

                // 이메일 인증 완료
                if (!data?.user?.id) {
                    setStatus('error');
                    setMessage('사용자 정보를 가져올 수 없습니다.');
                    return;
                }

                setStatus('success');
                setMessage('인증이 완료되었습니다. 잠시 후 로그인 페이지로 이동합니다.');
                setTimeout(() => {
                    router.push('/auth/sign-in');
                }, 2000);
            }).catch((error) => {
                setStatus('error');
                setMessage('인증에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다.');
            });
        }
    }, [token_hash]);


    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2">
            <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200">
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">인증 완료!</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <Link
                                href="/auth/sign-in"
                                className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
                            >
                                로그인
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
                                    className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/auth/sign-up"
                                    className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
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
                                    <MailIcon className='w-10 h-10 text-[#3b82f6]' />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증 실패</h2>
                            <p className="text-gray-600 mb-4">{message}</p>
                            <p className="text-sm text-gray-500 mb-6">
                                이메일을 확인하고 인증 링크를 클릭해주세요.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/auth/sign-in"
                                    className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors"
                                >
                                    로그인
                                </Link>
                                <button
                                    onClick={resendEmail}
                                    disabled={isResending}
                                    className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                                >
                                    {isResending ? '재발송 중...' : '재발송'}
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
                        로그인
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

export default function VerifyEmailToken({ email, token_hash }: VerifyEmailTokenProps) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200">
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
            <VerifyEmailTokenContent email={email} token_hash={token_hash} />
        </Suspense>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox, Button, Dialog, DialogContent } from '@/src/shared/ui';
import { checkTermsAgreement } from '../api/auth-actions';
import { saveTermsAgreement } from '../api/auth-client';
import { CURRENT_TERMS_VERSION, CURRENT_TERMS_VERSION_DB } from '@/src/shared/lib/auth';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';

interface TermsAgreementPageClientProps {
    userId: string;
}

export default function TermsAgreementPageClient({
    userId,
}: TermsAgreementPageClientProps) {
    const router = useRouter();
    const versionForDb = CURRENT_TERMS_VERSION_DB;

    const [termsAgreed, setTermsAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [termsLoading, setTermsLoading] = useState(true);
    const [savingTerms, setSavingTerms] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalUrl, setModalUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // 약관 동의 여부 확인
    useEffect(() => {
        const loadTermsAgreement = async () => {
            try {
                const { termsAgreed, privacyAgreed } = await checkTermsAgreement(
                    userId,
                    versionForDb
                );
                setTermsAgreed(termsAgreed);
                setPrivacyAgreed(privacyAgreed);
                setTermsLoading(false);

                // 이미 약관 동의가 완료되어 있으면 메인으로 리디렉션
                if (termsAgreed && privacyAgreed) {
                    router.push('/');
                    router.refresh();
                }
            } catch (error) {
                console.error('약관 동의 확인 오류:', error);
                setTermsLoading(false);
            }
        };

        loadTermsAgreement();
    }, [userId, versionForDb, router]);

    // 약관 동의 저장
    const handleSave = async () => {
        // 체크된 약관이 없으면 에러
        if (!termsAgreed || !privacyAgreed) {
            setErrorMessage('모든 약관에 동의해주세요.');
            return;
        }

        setSavingTerms(true);
        try {
            const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null;

            // 이용약관 동의 저장
            if (termsAgreed) {
                const termsResult = await saveTermsAgreement(
                    userId,
                    'terms',
                    versionForDb,
                    userAgent
                );
                if (!termsResult.success) {
                    setErrorMessage('이용약관 동의 저장에 실패했습니다.');
                    setSavingTerms(false);
                    return;
                }
            }

            // 개인정보 수집 및 이용 동의 저장
            if (privacyAgreed) {
                const privacyResult = await saveTermsAgreement(
                    userId,
                    'privacy',
                    versionForDb,
                    userAgent
                );
                if (!privacyResult.success) {
                    setErrorMessage('개인정보 동의 저장에 실패했습니다.');
                    setSavingTerms(false);
                    return;
                }
            }

            // 약관 동의는 terms_agreements 테이블에 저장되므로 별도 업데이트 불필요
            // if (tempTermsAgreed && tempPrivacyAgreed) {
            //     const supabase = createBrowserClient();
            //     const { data, error } = await supabase.from('profiles').update({
            //         terms_agreed: true,
            //         privacy_agreed: true,
            //     }).eq('id', userId);
            // }

            // 메인 페이지로 리디렉션
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('약관 동의 저장 오류:', error);
            setErrorMessage('약관 동의 저장 중 오류가 발생했습니다.');
        } finally {
            setSavingTerms(false);
        }
    };

    if (termsLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200">
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">확인 중...</h2>
                            <p className="text-gray-600">약관 동의 여부를 확인하고 있습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-1 items-center justify-center p-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">약관 동의</h2>
                        <p className="text-gray-600">서비스 이용을 위해 약관 동의가 필요합니다.</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="terms-page"
                                checked={termsAgreed}
                                onCheckedChange={(checked) => {
                                    setTermsAgreed(!!checked);
                                    setErrorMessage('');
                                }}
                                className="mt-1"
                            />
                            <label
                                htmlFor="terms-page"
                                className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
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

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="privacy-page"
                                checked={privacyAgreed}
                                onCheckedChange={(checked) => {
                                    setPrivacyAgreed(!!checked);
                                    setErrorMessage('');
                                }}
                                className="mt-1"
                            />
                            <label
                                htmlFor="privacy-page"
                                className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
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

                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={savingTerms || !(termsAgreed && privacyAgreed)}
                        className="w-full h-10"
                    >
                        {savingTerms ? '저장 중...' : '약관 동의 완료'}
                    </Button>
                </div>
            </div>

            {/* 약관 모달 */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0">
                    <div className="flex flex-col overflow-hidden">
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


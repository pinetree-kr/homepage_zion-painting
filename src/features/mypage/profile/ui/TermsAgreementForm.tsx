'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Checkbox, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { Save } from 'lucide-react';
import { checkTermsAgreement } from '@/src/features/auth/api/auth-actions';
import { saveTermsAgreement } from '@/src/features/auth/api/auth-client';

interface TermsAgreementFormProps {
  userId: string;
  currentVersion: string;
  onSuccess?: () => void;
}

export default function TermsAgreementForm({
  userId,
  currentVersion,
  onSuccess,
}: TermsAgreementFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const versionForDb = currentVersion.replace(/-/g, '');
  
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [tempTermsAgreed, setTempTermsAgreed] = useState(false);
  const [tempPrivacyAgreed, setTempPrivacyAgreed] = useState(false);
  const [termsLoading, setTermsLoading] = useState(true);
  const [savingTerms, setSavingTerms] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

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
        setTempTermsAgreed(termsAgreed);
        setTempPrivacyAgreed(privacyAgreed);
        setTermsLoading(false);
      } catch (error) {
        console.error('약관 동의 확인 오류:', error);
        setTermsLoading(false);
      }
    };

    loadTermsAgreement();
  }, [userId, versionForDb]);

  // 약관 동의 저장
  const handleSave = async () => {
    // 체크된 약관이 없으면 에러
    if (!tempTermsAgreed || !tempPrivacyAgreed) {
      setErrorMessage('모든 약관에 동의해주세요.');
      setShowErrorModal(true);
      return;
    }

    setSavingTerms(true);
    try {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null;
      
      // 이용약관 동의 저장
      if (tempTermsAgreed && !termsAgreed) {
        const termsResult = await saveTermsAgreement(
          userId,
          'terms',
          versionForDb,
          userAgent
        );
        if (!termsResult.success) {
          setErrorMessage('이용약관 동의 저장에 실패했습니다.');
          setShowErrorModal(true);
          setSavingTerms(false);
          return;
        }
      }

      // 개인정보 수집 및 이용 동의 저장
      if (tempPrivacyAgreed && !privacyAgreed) {
        const privacyResult = await saveTermsAgreement(
          userId,
          'privacy',
          versionForDb,
          userAgent
        );
        if (!privacyResult.success) {
          setErrorMessage('개인정보 동의 저장에 실패했습니다.');
          setShowErrorModal(true);
          setSavingTerms(false);
          return;
        }
      }

      // 저장 성공
      setTermsAgreed(tempTermsAgreed);
      setPrivacyAgreed(tempPrivacyAgreed);
      
      // 약관 동의가 완료되면 쿼리 파라미터 제거
      if (searchParams?.get('terms_required') === 'true') {
        router.replace('/mypage/profile');
      }

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('약관 동의 저장 오류:', error);
      setErrorMessage('약관 동의 저장 중 오류가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setSavingTerms(false);
    }
  };
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-2xl font-normal text-[#101828]">약관 동의 필요</CardTitle>
        <p className="text-sm text-[#4D4D4D] mt-2">
          서비스 이용을 위해 약관 동의가 필요합니다.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-profile"
              checked={tempTermsAgreed}
              onCheckedChange={(checked) => {
                setTempTermsAgreed(!!checked);
              }}
              disabled={termsLoading}
              className="mt-1"
            />
            <label
              htmlFor="terms-profile"
              className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setModalUrl(`/terms/${currentVersion}`);
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
              id="privacy-profile"
              checked={tempPrivacyAgreed}
              onCheckedChange={(checked) => {
                setTempPrivacyAgreed(!!checked);
              }}
              disabled={termsLoading}
              className="mt-1"
            />
            <label
              htmlFor="privacy-profile"
              className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setModalUrl(`/privacy/${currentVersion}`);
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
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={savingTerms || termsLoading || (tempTermsAgreed === termsAgreed && tempPrivacyAgreed === privacyAgreed)}
          size="lg"
          className="h-[42px] gap-2"
        >
          <Save className="h-4 w-4" />
          {savingTerms ? '저장 중...' : '약관 동의 저장'}
        </Button>
      </CardFooter>

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

      {/* 에러 모달 */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>저장 실패</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorModal(false)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


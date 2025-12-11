'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/shared/ui';
import ProfileForm from '@/src/features/mypage/profile/ui/ProfileForm';
import PasswordForm from '@/src/features/mypage/profile/ui/PasswordForm';
import TermsAgreementForm from '@/src/features/mypage/profile/ui/TermsAgreementForm';
import AccountLinkingForm from '@/src/features/mypage/profile/ui/AccountLinkingForm';
import type { Profile } from '@/src/entities/user';
import { updateProfile } from '@/src/entities/user/model/updateProfile';
import { updatePassword } from '@/src/entities/user/model/updatePassword';
import { Save } from 'lucide-react';
import { CURRENT_TERMS_VERSION_DB } from '@/src/shared/lib/auth';

interface ProfileClientProps {
  user: Profile;
  termsRequired: boolean;
}

export default function ProfileClient({ user, termsRequired }: ProfileClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [profileFormData, setProfileFormData] = useState<{ name: string } | null>(null);
  const [passwordFormData, setPasswordFormData] = useState<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleProfileUpdate = async (data: { name: string }) => {
    setProfileFormData(data);
  };

  const handlePasswordUpdate = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordFormData(data);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 프로필 정보 업데이트
      if (profileFormData) {
        await updateProfile(user.id, profileFormData);
      }

      // 비밀번호 변경
      if (passwordFormData) {
        await updatePassword(
          user.email || '',
          passwordFormData.currentPassword,
          passwordFormData.newPassword
        );
      }

      // 성공 메시지 및 페이지 새로고침
      setShowSuccessModal(true);
      router.refresh();
      setProfileFormData(null);
      setPasswordFormData(null);
    } catch (error) {
      console.error('저장 실패:', error);
      setErrorMessage(error instanceof Error ? error.message : '저장에 실패했습니다.');
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // provider 확인 (이메일 가입자인지 확인)
  const provider = user.metadata?.signup_provider || 'email';
  const isEmailProvider = provider === 'email';

  return (
    <>
      <Container className="lg:max-w-6xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-normal text-[#101828]">프로필</h1>
            <p className="text-base text-[#4D4D4D] mt-2">
              회원님의 정보를 수정할 수 있습니다
            </p>
          </div>
          {/* 약관 동의 섹션 */}
          {termsRequired && (
            <TermsAgreementForm
              userId={user.id}
              currentVersion={CURRENT_TERMS_VERSION_DB}
              onSuccess={() => {
                setShowSuccessModal(true);
                router.refresh();
              }}
            />
          )}

          {/* 계정 연동 섹션 */}
          <AccountLinkingForm userId={user.id} currentEmail={user.email} />

          {/* 폼 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-normal text-[#101828]">기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ProfileForm user={user} onUpdate={handleProfileUpdate} />
                {isEmailProvider && <PasswordForm onUpdate={handlePasswordUpdate} />}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                size="lg"
                className="h-[42px] gap-2"
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="h-[42px] gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Container>

      {/* 성공 모달 */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>저장 완료</DialogTitle>
            <DialogDescription>
              저장되었습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)}>
              확인
            </Button>
          </DialogFooter>
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
    </>
  );
}


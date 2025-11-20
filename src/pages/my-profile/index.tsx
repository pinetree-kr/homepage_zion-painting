'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { ProfileForm, PasswordForm } from '@/src/features/mypage/profile';
import type { Profile } from '@/src/entities/user';
import { updateProfile, updatePassword } from '@/src/entities/user';
import { Save } from 'lucide-react';
import { getSupabaseUser, supabaseClient } from '@/src/shared/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  // const supabase = useSupabase();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getSupabaseUser();
        if (!user) {
          router.push('/auth/sign-in');
          return;
        }
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('id, name, email, role, status, email_verified, last_login, phone, created_at, updated_at')
          .eq('id', user?.id)
          .single<Profile>();

        if (!profileData) {
          router.push('/auth/sign-in');
          return;
        }

        setUser(profileData);
        setLoading(false);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        router.push('/auth/sign-in');
      }
    };

    loadUser();
  }, [router]);

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
    if (!user) return;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
        <div className="w-16 h-16 border-4 border-[#1A2C6D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="">
      <Container className="lg:max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-normal text-[#101828]">내 정보</h1>
            <p className="text-base text-[#4D4D4D]">
              프로필 정보 및 비밀번호를 변경할 수 있습니다
            </p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-[#E2E8F0] mb-6" />

        {/* 폼 섹션 */}
        <div className="space-y-6">
          <ProfileForm user={user} onUpdate={handleProfileUpdate} />
          <PasswordForm onUpdate={handlePasswordUpdate} />

          {/* 버튼 그룹 */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-9 px-4 py-2 border border-[#E2E8F0] rounded-[10px] text-sm text-[#1A1A1A] bg-white hover:bg-gray-50"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-4 py-2 bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] rounded-[10px] text-sm text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
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
    </div>
  );
}


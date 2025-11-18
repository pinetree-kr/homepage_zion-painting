'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { ProfileForm, PasswordForm } from '@/src/features/mypage/profile';
import { checkSupabaseSession, getSupabaseUser, supabase } from '@/src/shared/lib/supabase/client';
import type { Profile } from '@/src/entities/user';
import { Save } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileFormData, setProfileFormData] = useState<{ name: string } | null>(null);
  const [passwordFormData, setPasswordFormData] = useState<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const hasSession = await checkSupabaseSession();
        if (!hasSession) {
          router.push('/auth/sign-in');
          return;
        }

        const supabaseUser = await getSupabaseUser();
        if (!supabaseUser) {
          router.push('/auth/sign-in');
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, email, role, status, email_verified, last_login, phone, created_at, updated_at')
          .eq('id', supabaseUser.id)
          .single<Profile>();

        if (!profileData) {
          router.push('/auth/sign-in');
          return;
        }

        const userData: Profile = {
          id: supabaseUser.id,
          email: profileData?.email || supabaseUser.email || '',
          name: profileData?.name || supabaseUser.user_metadata?.name || '사용자',
          role: profileData?.role === 'admin' ? 'admin' : 'user',
          email_verified: profileData?.email_verified ?? (supabaseUser.email_confirmed_at !== null),
          created_at: profileData?.created_at,
          updated_at: profileData?.updated_at,
          status: profileData?.status || null,
          last_login: profileData?.last_login || null,
          phone: profileData?.phone || null,
        };

        setUser(userData);
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
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: profileFormData.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          throw new Error('프로필 업데이트 실패: ' + profileError.message);
        }
      }

      // 비밀번호 변경
      if (passwordFormData) {
        // 현재 비밀번호 확인
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email || '',
          password: passwordFormData.currentPassword,
        });

        if (signInError) {
          throw new Error('현재 비밀번호가 올바르지 않습니다.');
        }

        // 새 비밀번호로 변경
        const { error: updateError } = await supabase.auth.updateUser({
          password: passwordFormData.newPassword,
        });

        if (updateError) {
          throw new Error('비밀번호 변경 실패: ' + updateError.message);
        }
      }

      // 성공 메시지 및 페이지 새로고침
      alert('저장되었습니다.');
      router.refresh();
      setProfileFormData(null);
      setPasswordFormData(null);
    } catch (error) {
      console.error('저장 실패:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
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
    <div className="py-[105px] px-[227.5px]">
      <Container className="max-w-[862px] mx-auto">
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
              disabled={isSaving || (!profileFormData && !passwordFormData)}
              className="h-9 px-4 py-2 bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] rounded-[10px] text-sm text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}


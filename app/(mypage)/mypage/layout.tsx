'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyPageLayout } from '@/src/features/layout';
import { checkSupabaseSession, getSupabaseUser, supabase } from '@/src/shared/lib/supabase/client';
import type { Profile } from '@/src/entities/user/model/types';
import type { User } from '@/src/entities/user';

export default function MyPageLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Supabase 세션 확인
        const hasSession = await checkSupabaseSession();
        if (!hasSession) {
          router.push('/auth/sign-in');
          return;
        }

        // Supabase 사용자 정보 가져오기
        const supabaseUser = await getSupabaseUser();
        if (!supabaseUser) {
          router.push('/auth/sign-in');
          return;
        }

        // profiles 테이블에서 사용자 프로필 정보 가져오기
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, email, role, status, email_verified, last_login, phone, created_at, updated_at')
          .eq('id', supabaseUser.id)
          .single<Profile>();

        if (!profileData) {
          router.push('/auth/sign-in');
          return;
        }

        // User 타입으로 변환
        const userData: User = {
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
        console.error('인증 확인 중 오류 발생:', error);
        router.push('/auth/sign-in');
      }
    };

    checkAuth();
  }, [router]);

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
    <MyPageLayout user={user}>
      {children}
    </MyPageLayout>
  );
}


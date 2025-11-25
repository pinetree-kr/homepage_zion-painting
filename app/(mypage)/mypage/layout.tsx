'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MyPageLayout from '@/src/features/layout/MyPageLayout';
import type { Profile } from '@/src/entities/user/model/types';
import { supabaseClient } from '@/src/shared/lib/supabase/client';

export default function MyPageLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<Profile | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  // const supabase = useSupabase(); 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
          router.push('/auth/sign-in');
          return;
        }

        // profiles 테이블에서 사용자 프로필 정보 가져오기
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single<Profile>();

        if (!profileData) {
          router.push('/auth/sign-in');
          return;
        }

        setUser(profileData);
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
    <MyPageLayout>
      {children}
    </MyPageLayout>
  );
}


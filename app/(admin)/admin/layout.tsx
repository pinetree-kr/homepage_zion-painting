'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logout, User } from '@/src/features/auth';
import { AdminLayout } from '@/src/widgets/admin-layout';
import { checkSupabaseSession, getSupabaseUser, supabase } from '@/src/shared/lib';
import type { Profile } from '@/src/shared/lib/supabase-types';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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

        // administrators 테이블에서 관리자 권한 확인
        const { data: adminData, error: adminError } = await supabase
          .from('administrators')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (adminError || !adminData) {
          // 관리자가 아닌 경우 로그인 페이지로 리다이렉트
          router.push('/auth/sign-in');
          return;
        }

        // profiles 테이블에서 사용자 프로필 정보 가져오기
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, email, status, email_verified, last_login, phone, created_at')
          .eq('id', supabaseUser.id)
          .single<Profile>();

        // User 타입으로 변환 (Profile과 Administrator 데이터 사용)
        const userData: User = {
          id: supabaseUser.id,
          email: profileData?.email || supabaseUser.email || '',
          name: profileData?.name || supabaseUser.user_metadata?.name || '사용자',
          role: 'admin', // administrators 테이블에 있으면 관리자
          emailVerified: profileData?.email_verified ?? (supabaseUser.email_confirmed_at !== null),
          createdAt: profileData?.created_at,
          status: profileData?.status || undefined,
          lastLogin: profileData?.last_login || undefined,
          phone: profileData?.phone || undefined,
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

  const handleLogout = async () => {
    try {
      // Supabase 로그아웃
      await supabase.auth.signOut();
      // 기존 localStorage 기반 로그아웃도 호출 (호환성 유지)
      logout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류가 발생해도 로그아웃 처리
      logout();
      router.push('/');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#1A2C6D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 현재 경로에 따라 activeTab 결정
  const getActiveTab = () => {
    if (pathname?.startsWith('/admin/info')) {
      if (pathname === '/admin/info/prologue') return 'prologue';
      if (pathname === '/admin/info/company') return 'company-info';
      if (pathname === '/admin/info/business') return 'business-info';
      if (pathname === '/admin/info/products') return 'products-admin';
      if (pathname === '/admin/info/contacts') return 'contact-info';
      return 'prologue';
    }
    if (pathname?.startsWith('/admin/customer')) {
      if (pathname === '/admin/customer/members') return 'members';
      if (pathname === '/admin/customer/notices') return 'notice';
      if (pathname === '/admin/customer/qna') return 'qna';
      if (pathname === '/admin/customer/estimates') return 'quote';
      if (pathname === '/admin/customer/reviews') return 'review';
      return 'members';
    }
    if (pathname?.startsWith('/admin/system')) {
      if (pathname === '/admin/system/administrators') return 'admin-management';
      if (pathname === '/admin/system/logs') return 'logs';
      if (pathname === '/admin/system/resources') return 'resources';
      return 'admin-management';
    }
    return 'prologue';
  };

  const handleTabChange = (tab: string) => {
    const routeMap: Record<string, string> = {
      'prologue': '/admin/info/prologue',
      'company-info': '/admin/info/company',
      'business-info': '/admin/info/business',
      'products-admin': '/admin/info/products',
      'contact-info': '/admin/info/contacts',
      'members': '/admin/customer/members',
      'notice': '/admin/customer/notices',
      'qna': '/admin/customer/qna',
      'quote': '/admin/customer/estimates',
      'review': '/admin/customer/reviews',
      'admin-management': '/admin/system/administrators',
      'logs': '/admin/system/logs',
      'resources': '/admin/system/resources',
    };
    
    const route = routeMap[tab];
    if (route) {
      router.push(route);
    }
  };

  return (
    <AdminLayout
      user={user}
      activeTab={getActiveTab()}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      onSettingsClick={() => {
        // 사용자 설정 페이지로 이동 (추후 구현)
        console.log('Settings clicked');
      }}
    >
      {children}
    </AdminLayout>
  );
}


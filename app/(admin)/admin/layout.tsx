'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logout, User } from '@/src/features/auth';
import { AdminLayout } from '@/src/features/admin/layout';
import { checkSupabaseSession, getSupabaseUser, supabase } from '@/src/shared/lib/supabase/client';
import type { Profile } from '@/src/entities/user/model/types';

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

        // profiles 테이블에서 사용자 프로필 정보 가져오기 (role 포함)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, email, role, status, email_verified, last_login, phone, created_at')
          .eq('id', supabaseUser.id)
          .single<Profile>();

        // 관리자 여부 확인 (profiles 테이블의 role 사용)
        if (!profileData || profileData.role !== 'admin') {
          // 관리자가 아닌 경우 로그인 페이지로 리다이렉트
          router.push('/auth/sign-in');
          return;
        }

        // 개발 단계에서는 관리자 권한을 분리하지 않음
        // 관리자 모드 접근 시 administrators 테이블에서 세부 권한 가져오기
        // const { data: adminData, error: adminError } = await supabase
        //   .from('administrators')
        //   .select('role')
        //   .eq('id', supabaseUser.id)
        //   .single();

        // if (adminError) {
        //   console.error('관리자 세부 권한 조회 실패:', adminError);
        //   // 세부 권한 조회 실패해도 관리자 모드 접근은 허용 (profiles.role이 'admin'이면)
        // }

        // User 타입으로 변환 (Profile의 role 사용)
        const userData: User = {
          id: supabaseUser.id,
          email: profileData?.email || supabaseUser.email || '',
          name: profileData?.name || supabaseUser.user_metadata?.name || '사용자',
          role: 'admin', // profiles 테이블에서 확인됨
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
      if (pathname.startsWith('/admin/info/company')) return 'company-info';
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
      'company-info': '/admin/info/company/about',
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


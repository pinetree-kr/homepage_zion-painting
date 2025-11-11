'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, isAdmin, logout, User } from '@/src/features/auth';
import { AdminLayout } from '@/src/widgets/admin-layout';

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
    const currentUser = getCurrentUser();
    if (!currentUser || !isAdmin(currentUser)) {
      router.push('/auth/sign-in');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
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
      if (pathname === '/admin/info/company') return 'company-info';
      if (pathname === '/admin/info/business') return 'business-info';
      if (pathname === '/admin/info/products') return 'products-admin';
      if (pathname === '/admin/info/contacts') return 'contact-info';
      return 'company-info';
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
    return 'company-info';
  };

  const handleTabChange = (tab: string) => {
    const routeMap: Record<string, string> = {
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


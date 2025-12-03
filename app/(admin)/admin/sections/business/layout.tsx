'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 따라 활성 탭 결정
  const getActiveTab = () => {
    if (pathname?.endsWith('/introduction')) return 'introduction';
    if (pathname?.endsWith('/areas')) return 'areas';
    if (pathname?.endsWith('/categories')) return 'categories';
    if (pathname?.includes('/achievements')) return 'achievements';
    return 'introduction'; // 기본값
  };

  const handleTabChange = (value: string) => {
    router.push(`/admin/sections/business/${value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">사업정보 관리</h2>
          <p className="text-gray-500 text-sm mt-1">사업소개, 사업분야, 적용산업, 사업실적을 관리합니다</p>
        </div>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="introduction">소개글</TabsTrigger>
          <TabsTrigger value="areas">사업분야</TabsTrigger>
          <TabsTrigger value="achievements">사업실적</TabsTrigger>
          <TabsTrigger value="categories">적용산업</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
}


'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui';

export default function SiteSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 따라 활성 탭 결정
  const getActiveTab = () => {
    if (pathname?.endsWith('/prologue')) return 'prologue';
    if (pathname?.endsWith('/contact')) return 'contact';
    return 'prologue'; // 기본값
  };

  const handleTabChange = (value: string) => {
    router.push(`/admin/site-settings/default/${value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">사이트 설정</h2>
          <p className="text-gray-500 text-sm mt-1">프롤로그와 오시는 길·연락처를 관리합니다</p>
        </div>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prologue">프롤로그</TabsTrigger>
          <TabsTrigger value="contact">오시는 길 · 연락처</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
}

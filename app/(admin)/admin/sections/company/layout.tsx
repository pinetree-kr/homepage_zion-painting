'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 따라 활성 탭 결정
  const getActiveTab = () => {
    if (pathname?.endsWith('/introduction')) return 'introduction';
    if (pathname?.endsWith('/strengths')) return 'strengths';
    if (pathname?.endsWith('/visions-and-values')) return 'visions-and-values';
    if (pathname?.endsWith('/greetings')) return 'greetings';
    if (pathname?.endsWith('/histories')) return 'histories';
    if (pathname?.endsWith('/organizations')) return 'organizations';
    if (pathname?.endsWith('/contact')) return 'contact';
    return 'introduction'; // 기본값
  };

  const handleTabChange = (value: string) => {
    router.push(`/admin/sections/company/${value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">회사정보 관리</h2>
          <p className="text-gray-500 text-sm mt-1">회사소개, 강점, 비전·핵심가치, 인사말·경영철학, 연혁, 조직도, 오시는 길 · 연락처를 관리합니다</p>
        </div>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="introduction">소개글</TabsTrigger>
          <TabsTrigger value="strengths">강점</TabsTrigger>
          <TabsTrigger value="visions-and-values">비전 · 핵심가치</TabsTrigger>
          <TabsTrigger value="greetings">인사말 · 경영철학</TabsTrigger>
          <TabsTrigger value="histories">연혁</TabsTrigger>
          <TabsTrigger value="organizations">조직도</TabsTrigger>
          <TabsTrigger value="contact">오시는 길 · 연락처</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
}


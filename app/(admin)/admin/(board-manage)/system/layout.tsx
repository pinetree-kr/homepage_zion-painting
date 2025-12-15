'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui';

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 따라 활성 탭 결정
  const getActiveTab = () => {
    if (pathname?.endsWith('/board-connections')) return 'board-connections';
    if (pathname?.endsWith('/list') || pathname?.endsWith('/boards')) return 'list';
    return 'list'; // 기본값
  };

  const handleTabChange = (value: string) => {
    if (value === 'board-connections') {
      router.push('/admin/system/board-connections');
    } else if (value === 'list') {
      router.push('/admin/system/boards/list');
    } else {
      router.push(`/admin/system/boards/${value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">게시판 설정</h2>
          <p className="text-gray-500 text-sm mt-1">게시판 목록 및 연결 설정을 관리합니다</p>
        </div>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">게시판 목록</TabsTrigger>
          <TabsTrigger value="board-connections">연결 설정</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
}


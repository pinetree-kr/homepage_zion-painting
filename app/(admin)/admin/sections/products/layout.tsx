'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/src/shared/ui';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 따라 활성 탭 결정
  const getActiveTab = () => {
    if (pathname?.endsWith('/board-settings')) return 'board-settings';
    if (pathname?.endsWith('/categories')) return 'categories';
    if (pathname?.endsWith('/introduction')) return 'introduction';
    if (pathname?.endsWith('/products') || pathname === '/admin/sections/products') return 'products';
    return 'products'; // 기본값
  };

  const handleTabChange = (value: string) => {
    if (value === 'products') {
      router.push('/admin/sections/products');
    } else {
      router.push(`/admin/sections/products/${value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">제품정보 관리</h2>
          <p className="text-gray-500 text-sm mt-1">제품 소개글, 제품 목록, 카테고리, 게시판 연결을 관리합니다</p>
        </div>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="introduction">소개글</TabsTrigger>
          <TabsTrigger value="products">제품 목록</TabsTrigger>
          <TabsTrigger value="categories">제품 카테고리</TabsTrigger>
          <TabsTrigger value="board-settings">게시판 연결 설정</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
}


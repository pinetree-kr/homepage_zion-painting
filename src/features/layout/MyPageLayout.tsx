'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import UserMenu from '@/src/widgets/user/ui/UserMenu';
import { User as UserIcon, MessageSquare } from 'lucide-react';

interface MyPageLayoutProps {
  children: React.ReactNode;
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: 'profile',
      label: '프로필',
      icon: UserIcon,
      href: '/mypage/profile',
    },
    {
      id: 'inquiries',
      label: '1:1 문의 내역',
      icon: MessageSquare,
      href: '/mypage/inquiries',
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-[73px]">
        <div className="flex items-center justify-between px-6 py-4 h-full">
          <div className="flex items-center gap-4">
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="메뉴"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5"
                  stroke="#4A5565"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block"
              aria-label="뒤로가기"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="#4A5565"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button> */}
            <div className="flex items-center gap-3 hidden lg:block">
              <div className="bg-[#F4F6F8] rounded-lg border-2 border-gray-300 p-2 shadow-sm">
                <Link href="/">
                  <Image
                    src="/logo-192.png"
                    alt="시온"
                    width={24}
                    height={24}
                    className="h-6 w-auto"
                  />
                </Link>
              </div>
            </div>
          </div>
          <span className="text-gray-900 text-lg font-semibold">마이페이지</span>
          <div className="flex items-center gap-4">
            {/* 사용자 드롭다운 메뉴 */}
            <UserMenu isScrolled={false} />
          </div>
        </div>
      </header>

      <div className="flex pt-[73px] h-[calc(100vh)]">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 
          top-[73px] bottom-0 lg:top-[73px] lg:bottom-auto
          flex flex-col h-[calc(100vh-73px)] lg:h-full
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* 스크롤 가능한 메뉴 영역 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0 pb-4">
            <div className="mb-4">
              <p className="text-gray-500 text-sm">마이페이지</p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active
                        ? 'bg-[#1A2C6D] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 홈으로 가기 버튼 - 사이드바 최하단 고정 */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>홈으로 가기</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full ml-0 lg:ml-0">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}


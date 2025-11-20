'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { User } from '@/src/entities/user';
import UserMenu from '@/src/widgets/user/ui/UserMenu';

interface MyPageLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function MyPageLayout({ user, children }: MyPageLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-[73px]">
        <div className="flex items-center justify-between px-6 py-4 h-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-[#F4F6F8] rounded-lg border-2 border-gray-300 p-2 shadow-sm">
                <Image
                  src="/logo-192.png"
                  alt="시온"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </div>
          {/* <Link href="/" className="flex items-center">
            <Image
              src="/logo-192.png"
              alt="시온 페인팅"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link> */}
          <span className="text-gray-900 text-lg font-semibold">마이페이지</span>
          <div className="flex items-center gap-4">
            {/* 사용자 드롭다운 메뉴 */}
            <UserMenu isScrolled={false} />
          </div>
        </div>
      </header>

      {/* 컨텐츠 */}
      <div className="flex pt-[73px] h-[calc(100vh)]">
        <main className="flex-1 overflow-y-auto h-full">
          {children}
        </main>
      </div>
    </div >
  );
}


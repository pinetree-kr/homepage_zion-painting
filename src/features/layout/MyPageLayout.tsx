'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { UserButton } from './ui';
import type { User } from '@/src/entities/user';

interface MyPageLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function MyPageLayout({ user, children }: MyPageLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-[74px]">
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
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo-192.png"
                  alt="시온 페인팅"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>
            <UserButton user={user} size="md" />
          </div>
        </div>
      </header>

      {/* 컨텐츠 */}
      <main>{children}</main>
    </div>
  );
}


'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { type User } from '@/src/entities/user';
import { LogOut, Settings, Building2, Briefcase, Package, MessageSquare, Home as HomeIcon, FileText } from 'lucide-react';
import { getScrollbarWidth } from '@/src/shared/lib/utils';
import UserMenu from '@/src/widgets/user/ui/UserMenu';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { getSiteSettings } from '@/src/features/post/api/post-actions';
import { SiteSetting } from '@/src/entities/site-setting/model/types';

interface HeaderProps {
  enableScrollAnimation?: boolean;
}

export default function Header({ enableScrollAnimation = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!enableScrollAnimation);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCustomerCenterOpen, setIsCustomerCenterOpen] = useState(false);
  const [defaultBoards, setDefaultBoards] = useState<SiteSetting["default_boards"] | null>(null);
  const customerCenterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  // const supabase = useSupabase();

  useEffect(() => {
    // 스크롤바 너비를 CSS 변수로 설정 (스크롤바 쉬프팅 방지용)
    const scrollbarWidth = getScrollbarWidth();
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

    // 스크롤 애니메이션이 활성화된 경우에만 스크롤 이벤트 리스너 추가
    if (enableScrollAnimation) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [enableScrollAnimation]);

  // default_boards 데이터 가져오기
  useEffect(() => {
    const loadDefaultBoards = async () => {
      try {
        const siteSettings = await getSiteSettings();
        setDefaultBoards(siteSettings?.default_boards || null);
      } catch (error) {
        console.error('사이트 설정 로드 오류:', error);
        setDefaultBoards(null);
      }
    };

    loadDefaultBoards();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient();
      // Supabase 로그아웃
      await supabase.auth.signOut();
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    }
  };

  // 모바일 메뉴 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // 고객센터 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerCenterRef.current && !customerCenterRef.current.contains(event.target as Node)) {
        setIsCustomerCenterOpen(false);
      }
    };

    if (isCustomerCenterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCustomerCenterOpen]);


  const navItems = [
    { label: '회사소개', href: '/about', icon: Building2 },
    { label: '사업소개', href: '/business', icon: Briefcase },
    { label: '제품소개', href: '/products', icon: Package },
    { label: '문의', href: '/contact', icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  // default_boards를 display_order 기준으로 정렬하여 메뉴 아이템 생성
  const customerCenterItems = useMemo(() => defaultBoards
    ? Object.entries(defaultBoards || {})
      .filter(([_, board]) => board && board.id) // id가 있는 게시판만 표시
      .sort(([_, a], [__, b]) => {
        const orderA = a?.display_order ?? 999;
        const orderB = b?.display_order ?? 999;
        return orderA - orderB;
      })
      .map(([_, board]) => ({
        id: board!.id!,
        name: board!.name,
      }))
    : [], [defaultBoards]);

  // 고객센터 아이콘 매핑
  const getBoardIcon = (key: string) => {
    const iconMap: { [key: string]: any } = {
      notice: FileText,
      inquiry: MessageSquare,
      pds: FileText,
      product: Package,
    };
    return iconMap[key] || FileText;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-[73px] ${enableScrollAnimation
          ? 'transition-colors transition-shadow duration-300'
          : ''
          } ${
          // 스크롤 애니메이션이 비활성화된 경우 항상 배경색과 그림자 표시
          // 스크롤 애니메이션이 활성화된 경우: 모바일/태블릿은 항상 배경색, 데스크톱은 스크롤 시에만 배경색
          !enableScrollAnimation || isScrolled || isMenuOpen
            ? 'bg-white shadow-lg border-b border-gray-200'
            : 'bg-white shadow-md border-b border-gray-200 md:bg-transparent md:shadow-none md:border-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-full">
          <nav className="flex items-center justify-between h-full">
            {/* 모바일: 햄버거 버튼 (좌측) */}
            <button
              className="md:hidden p-2 -ml-2 transition-colors duration-300 text-[#101828] hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5"
                    stroke="currentColor"
                    strokeWidth="1.67"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* 로고 - 모바일에서는 중앙, 데스크톱에서는 좌측 */}
            <Link href="/" className={`flex-1 flex justify-center md:flex-none md:justify-start ${isMenuOpen ? 'md:flex-1 md:justify-center' : ''
              }`}>
              <div className="flex items-center gap-3">
                <div className="bg-[#F4F6F8] rounded-lg border-2 border-gray-300 p-2 shadow-sm">
                  <Image
                    src="/logo-192.png"
                    alt="시온 페인팅"
                    width={24}
                    height={24}
                    className="h-6 w-auto"
                    priority
                  />
                </div>
              </div>
            </Link>

            {/* 데스크톱 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`text-base font-normal transition-colors duration-300 hover:text-[#1A2C6D] ${!enableScrollAnimation || isScrolled ? 'text-[#101828]' : 'text-white'
                    }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* 고객센터 드롭다운 */}
              {customerCenterItems.length > 0 && (
                <div
                  ref={customerCenterRef}
                  className="relative"
                >
                  <button
                    onClick={() => setIsCustomerCenterOpen(!isCustomerCenterOpen)}
                    className={`text-base font-normal transition-colors duration-300 hover:text-[#1A2C6D] flex items-center gap-1 ${!enableScrollAnimation || isScrolled ? 'text-[#101828]' : 'text-white'
                      }`}
                  >
                    고객센터
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-transform duration-200 ${isCustomerCenterOpen ? 'rotate-180' : ''}`}
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {/* 드롭다운 메뉴 */}
                  {isCustomerCenterOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {customerCenterItems.map((item) => (
                        <Link
                          key={item.id}
                          href={`/boards/${item.id}`}
                          onClick={() => setIsCustomerCenterOpen(false)}
                          className="block px-4 py-2 text-sm text-[#101828] hover:bg-gray-50 hover:text-[#1A2C6D] transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 로그인/사용자 메뉴 */}
              <div className="flex min-w-20 items-center justify-center">
                <UserMenu isScrolled={!enableScrollAnimation || isScrolled} />
              </div>
            </div>

            {/* 모바일: 프로필 메뉴 (우측) */}
            <div className="md:hidden flex items-center justify-center">
              <UserMenu isScrolled={!enableScrollAnimation || isScrolled} />
            </div>
          </nav>
        </div>
      </header>

      {/* 모바일 사이드 메뉴 오버레이 */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* 모바일 좌측 사이드 메뉴 */}
      <aside
        className={`
          fixed md:hidden left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 
          top-[73px] bottom-0
          flex flex-col h-[calc(100vh-73px)]
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* 스크롤 가능한 메뉴 영역 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0 pb-4">
          <div className="mb-4">
            <p className="text-gray-500 text-sm">메뉴</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
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

            {/* 고객센터 섹션 */}
            {customerCenterItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  고객센터
                </div>
                <div className="space-y-1">
                  {customerCenterItems.map((item) => {
                    // default_boards에서 key 찾기
                    const boardKey = defaultBoards
                      ? Object.entries(defaultBoards).find(([_, board]) => board?.id === item.id)?.[0] || ''
                      : '';
                    const BoardIcon = getBoardIcon(boardKey);
                    const active = pathname?.startsWith(`/boards/${item.id}`);
                    return (
                      <Link
                        key={item.id}
                        href={`/boards/${item.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${active
                          ? 'bg-[#1A2C6D] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <BoardIcon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* 홈으로 가기 버튼 - 사이드바 최하단 고정 */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HomeIcon className="h-4 w-4 flex-shrink-0" />
            <span>홈으로 가기</span>
          </Link>
        </div>
      </aside>
    </>
  );
}


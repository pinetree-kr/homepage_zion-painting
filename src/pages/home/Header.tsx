'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdmin, type User } from '@/src/features/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/src/shared/ui';
import { checkSupabaseSession, getSupabaseUser, supabase, onAuthStateChange } from '@/src/shared/lib/supabase/client';
import type { Profile } from '@/src/entities/user';
import { LogOut, Settings } from 'lucide-react';
import { getScrollbarWidth } from '@/src/shared/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // 스크롤바 너비를 CSS 변수로 설정 (스크롤바 쉬프팅 방지용)
    const scrollbarWidth = getScrollbarWidth();
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Supabase 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSession = await checkSupabaseSession();
        if (!hasSession) {
          setCurrentUser(null);
          return;
        }

        const supabaseUser = await getSupabaseUser();
        if (!supabaseUser) {
          setCurrentUser(null);
          return;
        }

        // profiles 테이블에서 사용자 프로필 정보 가져오기 (role 포함)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, email, role, status, email_verified, last_login, phone, created_at, updated_at')
          .eq('id', supabaseUser.id)
          .single<Profile>();

        // 개발 단계에서는 관리자 권한을 분리하지 않음
        // 관리자인 경우 administrators 테이블에서 세부 권한 가져오기
        // let adminDetailRole: 'system' | 'contents' | null = null;
        // if (profileData?.role === 'admin') {
        //   const { data: adminData } = await supabase
        //     .from('administrators')
        //     .select('role')
        //     .eq('id', supabaseUser.id)
        //     .single();
        //   adminDetailRole = adminData?.role || null;
        // }

        // User 타입으로 변환 (Profile의 role 사용)
        const userData: User = {
          id: supabaseUser.id,
          email: profileData?.email || supabaseUser.email || '',
          name: profileData?.name || supabaseUser.user_metadata?.name || '사용자',
          role: profileData?.role === 'admin' ? 'admin' : 'user', // profiles 테이블에서 결정
          email_verified: profileData?.email_verified ?? (supabaseUser.email_confirmed_at !== null),
          created_at: profileData?.created_at,
          updated_at: profileData?.updated_at,
          status: profileData?.status || null,
          last_login: profileData?.last_login || null,
          phone: profileData?.phone || null,
        };

        setCurrentUser(userData);
      } catch (error) {
        console.error('인증 상태 확인 중 오류 발생:', error);
        setCurrentUser(null);
      }
    };

    checkAuth();

    // Supabase 인증 상태 변경 리스너 설정
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
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

  // DropdownMenu 열림/닫힘 상태에 따른 스크롤바 쉬프팅 방지
  useEffect(() => {
    const headerElement = document.querySelector('header') as HTMLElement | null;
    if (!headerElement) return;

    const updateHeaderPadding = () => {
      const isScrollLocked = document.body.hasAttribute('data-scroll-locked');
      const bodyStyle = window.getComputedStyle(document.body);
      const bodyMarginRight = parseInt(bodyStyle.marginRight) || 0;
      
      // padding-right 변경 시 트랜지션 비활성화 (즉시 적용)
      const originalTransition = headerElement.style.transition;
      headerElement.style.transition = 'none';
      
      if (isScrollLocked && bodyMarginRight > 0) {
        // body에 margin-right가 적용되어 있으면 header에도 동일한 padding-right 적용
        headerElement.style.paddingRight = `${bodyMarginRight}px`;
      } else {
        // 스크롤 잠금이 해제되면 padding-right 제거
        headerElement.style.paddingRight = '';
      }
      
      // 다음 프레임에서 트랜지션 복원 (다른 속성 변화는 여전히 트랜지션 적용)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          headerElement.style.transition = originalTransition;
        });
      });
    };

    // 초기 상태 확인
    updateHeaderPadding();

    // body의 data-scroll-locked 속성 변화 감지
    const observer = new MutationObserver(() => {
      updateHeaderPadding();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked', 'style'],
    });

    return () => {
      observer.disconnect();
      // 정리 시 padding 제거
      if (headerElement) {
        headerElement.style.paddingRight = '';
      }
    };
  }, [isDropdownOpen]);

  const navItems = [
    { label: '회사소개', href: '#about' },
    { label: '사업소개', href: '#business' },
    { label: '제품소개', href: '#products' },
    { label: '문의', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors transition-shadow duration-300 ${
          // 모바일/태블릿: 항상 앱처럼 보이게 (배경색과 그림자)
          // 데스크톱: 스크롤 시에만 배경색
          // transition-all 대신 transition-colors, transition-shadow만 사용하여 padding-right는 트랜지션 제외
          isScrolled || isMenuOpen
            ? 'bg-white shadow-lg'
            : 'bg-white shadow-md md:bg-transparent md:shadow-none'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* 모바일: 햄버거 버튼 (좌측) */}
            <button
              className="md:hidden p-2 -ml-2 transition-colors duration-300 text-[#101828]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* 로고 - 모바일에서는 중앙, 데스크톱에서는 좌측 */}
            <div className={`flex-1 flex justify-center md:flex-none md:justify-start ${isMenuOpen ? 'md:flex-1 md:justify-center' : ''
              }`}>
              <div className="w-10 h-10 md:w-[52px] md:h-[52px] bg-white rounded-xl border-2 border-[#E5E7EB] shadow-sm p-2 md:p-2.5 flex items-center justify-center">
                <Image
                  src="/logo-192.png"
                  alt="시온 페인팅"
                  width={32}
                  height={32}
                  className="w-6 h-6 md:w-8 md:h-8"
                  priority
                />
              </div>
            </div>

            {/* 데스크톱 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-base font-normal transition-colors duration-300 hover:text-[#1A2C6D] ${isScrolled ? 'text-[#101828]' : 'text-white'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              {/* 고객센터 드롭다운 */}
              <div className="relative group">
                <button
                  className={`text-base font-normal transition-colors duration-300 hover:text-[#1A2C6D] flex items-center gap-1 ${isScrolled ? 'text-[#101828]' : 'text-white'
                    }`}
                >
                  고객센터
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform group-hover:rotate-180"
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
                {/* 드롭다운 메뉴는 추후 구현 */}
              </div>

              {/* 로그인/사용자 메뉴 */}
              {currentUser ? (
                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-normal outline-none transition-colors ${isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1A2C6D] flex items-center justify-center text-white text-sm font-medium">
                        {currentUser.name?.charAt(0)}
                      </div>
                      {/* <span className="hidden lg:inline">{currentUser.name ?? '-'}</span> */}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin(currentUser) && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                            <Settings className="h-4 w-4" />
                            <span>관리자 모드</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>로그아웃</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className={`px-4 py-2 rounded-lg text-base font-normal transition-colors ${isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                    }`}
                >
                  로그인
                </Link>
              )}
            </div>

            {/* 모바일: 우측 여백 (햄버거 버튼과 대칭) */}
            <div className="md:hidden w-10" />
          </nav>
        </div>
      </header>

      {/* 모바일 사이드 메뉴 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* 모바일 좌측 사이드 메뉴 */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* 사이드 메뉴 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl border-2 border-[#E5E7EB] shadow-sm p-2 flex items-center justify-center">
                <Image
                  src="/logo-192.png"
                  alt="시온 페인팅"
                  width={32}
                  height={32}
                  className="w-6 h-6"
                  priority
                />
              </div>
              <span className="text-lg font-semibold text-[#101828]">시온 페인팅</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="메뉴 닫기"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* 사이드 메뉴 내용 */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="flex flex-col">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.href)}
                  className="px-6 py-4 text-left text-base font-normal text-[#101828] hover:bg-gray-50 hover:text-[#1A2C6D] transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* 고객센터 섹션 */}
            <div className="mt-4 px-6">
              <div className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                고객센터
              </div>
              <div className="flex flex-col">
                <button className="px-6 py-3 text-left text-base font-normal text-[#101828] hover:bg-gray-50 hover:text-[#1A2C6D] transition-colors">
                  공지사항
                </button>
                <button className="px-6 py-3 text-left text-base font-normal text-[#101828] hover:bg-gray-50 hover:text-[#1A2C6D] transition-colors">
                  Q&A
                </button>
                <button className="px-6 py-3 text-left text-base font-normal text-[#101828] hover:bg-gray-50 hover:text-[#1A2C6D] transition-colors">
                  내 문의내역
                </button>
              </div>
            </div>
          </nav>

          {/* 사이드 메뉴 푸터 */}
          <div className="p-6 border-t border-gray-200">
            {currentUser ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
                {isAdmin(currentUser) && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-[#1A2C6D] text-white rounded-lg text-base font-normal text-center hover:bg-[#15204f] transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>관리자 모드</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-base font-normal hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full px-4 py-3 bg-[#1A2C6D] text-white rounded-lg text-base font-normal text-center hover:bg-[#15204f] transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}


"use client";

import type { Profile } from "@/src/entities/user/model/types";
import { useSignOut } from "@/src/entities/user/model/useSignOut";
// import { createBrowserClient } from "@/src/shared/lib/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/shared/ui/DropdownMenu";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabaseClient } from "@/src/shared/lib/supabase/client";

{/* 사용자 드롭다운 메뉴 */ }
export default function UserMenu({ isScrolled }: { isScrolled: boolean }) {
    // const { user, loading } = useCurrentUser();
    const [user, setUser] = useState<Profile | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadUser = async () => {
            // const supabase = createBrowserClient();

            const { data: { user } } = await supabaseClient.auth.getUser();

            if (!user) {
                setUser(undefined);
                setLoading(false);
                return;
            }

            const { data: profileData } = await supabaseClient
                .from('profiles')
                .select('id, name, email, role, status')
                .eq('id', user.id)
                .single<Profile>();

            if (!profileData) {
                setUser(undefined);
                setLoading(false);
                return;
            }

            setUser(profileData);
            setLoading(false);
        };
        loadUser();
    }, []);

    const { signOut } = useSignOut();
    const router = useRouter();
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


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

    const handleSignOut = useCallback(async () => {
        await signOut();

        // 현재 경로가 '/'인 경우 강제 새로고침, 아니면 일반 라우팅
        if (pathname === '/') {
            window.location.href = '/';
        } else {
            router.push('/');
            router.refresh();
        }
    }, [signOut, router, pathname])

    const handleMoveAdminPage = useCallback(() => {
        router.push('/admin');
    }, [router])

    const handleMoveMyPage = useCallback(() => {
        router.push('/mypage/profile');
    }, [router])

    if (loading) return (
        <div className="flex items-center justify-center w-10 h-10">
            <svg className="animate-spin text-white" width="24" height="24" viewBox="0 0 24 24">
                <circle
                    className="opacity-40"
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                />
                <path
                    className="opacity-80"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"
                />
            </svg>
        </div>
    )

    if (!user) return (
        <Link
            href="/auth/sign-in"
            className={`px-4 py-2 rounded-lg text-base font-normal transition-colors ${isScrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
                }`}
        >
            로그인
        </Link>
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <button className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] text-white flex items-center justify-center hover:opacity-80 transition-opacity outline-none">
                    <span className="text-sm font-medium">{user.name?.charAt(0)}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleMoveMyPage} className="cursor-pointer">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>마이페이지</span>
                </DropdownMenuItem>
                {
                    user.role === 'admin' && !pathname?.startsWith('/admin') && (
                        <>
                            <DropdownMenuItem onClick={handleMoveAdminPage} className="cursor-pointer">
                                <Settings className="h-4 w-4 mr-2" />
                                <span>관리자 모드</span>
                            </DropdownMenuItem>
                        </>
                    )
                }
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>로그아웃</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}
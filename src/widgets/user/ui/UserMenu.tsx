"use client";

import { useCurrentUser } from "@/src/entities/user/model/useCurrentUser";
import { useSignOut } from "@/src/entities/user/model/useSignOut";
import { isAdmin } from "@/src/shared/lib/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/shared/ui/DropdownMenu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";


{/* 사용자 드롭다운 메뉴 */ }
export default function UserMenu({ isScrolled }: { isScrolled: boolean }) {
    const { user, loading } = useCurrentUser();
    const { signOut } = useSignOut();
    const router = useRouter();
    const pathname = usePathname();

    const handleSignOut = useCallback(async () => {
        await signOut();
        router.push('/');
        router.refresh();
    }, [signOut, router])

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
            <DropdownMenuTrigger asChild>
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
                    <User className="h-4 w-4 mr-2" />
                    <span>마이페이지</span>
                </DropdownMenuItem>
                {
                    isAdmin(user) && !pathname?.startsWith('/admin') && (
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
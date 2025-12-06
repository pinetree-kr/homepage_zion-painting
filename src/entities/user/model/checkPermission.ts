"use server"

import { createServerClient } from "@/src/shared/lib/supabase/server";
import type { AppRole } from "@/src/entities/board/model/types";

/**
 * 관리자 여부 확인
 * administrators 테이블을 조회하여 확인합니다.
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return false;
        }

        // administrators 테이블에서 관리자 여부 확인
        const { data, error: adminError } = await supabase
            .from('administrators')
            .select('id')
            .eq('id', user.id)
            .is('deleted_at', null)
            .maybeSingle();

        if (adminError) {
            console.error('관리자 여부 확인 중 오류:', adminError);
            return false;
        }

        return data !== null;
    } catch (error) {
        console.error('관리자 여부 확인 중 오류:', error);
        return false;
    }
}

/**
 * 사용자의 현재 롤 확인
 * 로그인하지 않은 경우 null 반환, 로그인한 경우 'member' 또는 'admin' 반환
 */
export async function getUserRole(): Promise<{ user_id: string, role: AppRole } | null> {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null; // 로그인하지 않은 사용자
        }

        // administrators 테이블에서 관리자 여부 확인
        const { data, error: adminError } = await supabase
            .from('administrators')
            .select('id')
            .eq('id', user.id)
            .is('deleted_at', null)
            .maybeSingle();

        if (adminError) {
            console.error('관리자 여부 확인 중 오류:', adminError);
            return { user_id: user.id, role: 'member' }; // 오류 발생 시 일반 회원으로 간주
        }

        return data !== null ? { user_id: user.id, role: 'admin' } : { user_id: user.id, role: 'member' };
    } catch (error) {
        console.error('사용자 롤 확인 중 오류:', error);
        return null;
    }
}

export async function isVerified(): Promise<boolean> {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return user?.user_metadata?.email_verified === true;
}

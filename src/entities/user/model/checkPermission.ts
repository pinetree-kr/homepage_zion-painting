"use server"

import { createServerClient } from "@/src/shared/lib/supabase/server";

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

export async function isVerified(): Promise<boolean> {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return user?.user_metadata?.email_verified === true;
}

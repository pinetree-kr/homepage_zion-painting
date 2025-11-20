"use client";

import { supabaseClient } from "@/src/shared/lib/supabase/client";

export function useSignOut() {
    // const supabase = useSupabase();
    const signOut = async (): Promise<void> => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            throw new Error('로그아웃 중 오류 발생: ' + error.message);
        }
    }

    return { signOut };
}
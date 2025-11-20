"use server"

import { createServerClient } from "@/src/shared/lib/supabase/server";
import { Profile } from "./types";

export async function getUserSession() {
    const supabase = await createServerClient();

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
        throw new Error('세션 가져오기 오류');
    }

    return session;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
    try {
        const supabase = await createServerClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();


        if (userError) {
            console.log(userError);
            throw new Error('사용자 정보 가져오기 오류');
        }
        if (!user?.id) {
            return null;
        }

        const { data, error: profileError } = await supabase.from('profiles')
            .select('*')
            .eq('id', user.id)
            .eq('status', 'active')
            // .eq('email_verified', true)
            .single<Profile>();

        if (profileError) {
            throw new Error('프로필 가져오기 오류');
        }

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}
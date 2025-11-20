"use client";

import { useEffect, useState } from "react";
// import { useSupabase } from "@/src/shared/lib/supabase/client";
import { Profile } from "./types";
import { createBrowserClient } from "@/src/shared/lib/supabase/client";

export function useCurrentUser() {
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    // const supabase = useSupabase();

    useEffect(() => {
        let mounted = true;
        const supabase = createBrowserClient();
        supabase.auth.getSession().then(res => {
            console.log('res', res);
        })

        // const loadProfile = async (userId: string) => {
        //     try {
        //         console.log('loadProfile', userId);
        //         const { data, error: profileError } = await supabase.from('profiles')
        //             .select('*')
        //             .eq('id', userId)
        //             .single<Profile>()

        //         if (!mounted) return;

        //         if (profileError) {
        //             throw new Error('프로필 가져오기 오류');
        //         }
        //         setUser(data);
        //     } catch (error) {
        //         console.error(error);
        //         if (mounted) {
        //             setUser(null);
        //         }
        //     } finally {
        //         if (mounted) {
        //             setLoading(false);
        //         }
        //     }
        // };

        // supabase.auth.getUser().then(({ data: { user } }) => {
        //     if (user) {
        //         loadProfile(user.id);
        //     }
        // });


        // // onAuthStateChange를 사용하여 초기 세션을 가져옴 (쿠키 직접 읽기 방지)
        // const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        //     console.log('event', event);
        //     console.log('session', session);
        //     if (!mounted) return;

        //     if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        //         if (session?.user?.id) {
        //             await loadProfile(session.user.id);
        //         } else {
        //             setUser(null);
        //             setLoading(false);
        //         }
        //     } else if (event === 'SIGNED_OUT') {
        //         setUser(null);
        //         setLoading(false);
        //     }
        // });

        return () => {
            mounted = false;
            // subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}
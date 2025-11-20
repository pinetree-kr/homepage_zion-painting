"use client";

import { useEffect, useState } from "react";
import { supabase, onAuthStateChange } from "@/src/shared/lib/supabase/client";
import { Profile } from "./types";

export function useCurrentUser() {
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw new Error('세션 확인 오류');
                }

                if (!session?.user?.id) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const { data, error: profileError } = await supabase.from('profiles')
                    .select('*')
                    .eq('id', session?.user?.id)
                    .single<Profile>()

                if (profileError) {
                    throw new Error('프로필 가져오기 오류');
                }
                setUser(data);
            } catch (error) {
                console.error(error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getProfile();

        // Supabase 인증 상태 변경 리스너 설정
        const { data: { subscription } } = onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user?.id) {
                    try {
                        const { data, error: profileError } = await supabase.from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single<Profile>();

                        if (!profileError && data) {
                            setUser(data);
                        }
                    } catch (error) {
                        console.error('프로필 가져오기 오류:', error);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}
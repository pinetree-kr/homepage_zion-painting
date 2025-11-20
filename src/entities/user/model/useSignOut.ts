"use client";

import { supabase } from "@/src/shared/lib/supabase/client";

export function useSignOut() {
    const signOut = async () => {
        await supabase.auth.signOut();
    }

    return { signOut };
}
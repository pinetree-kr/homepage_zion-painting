"use server"

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../supabase-types';
import { supabaseUrl } from './config';

/**
 * Secret Key를 사용하는 Supabase 클라이언트 생성 함수
 * RLS 정책을 우회하여 모든 데이터에 접근할 수 있습니다.
 * 
 * ⚠️ 주의: Secret Key는 서버 사이드에서만 사용해야 하며,
 * 클라이언트에 노출되어서는 안 됩니다.
 * 
 * 사용 예시:
 * ```tsx
 * import { createServiceRoleClient } from '@/src/shared/lib/supabase/service';
 * 
 * const supabase = createServiceRoleClient();
 * const { data, error } = await supabase.from('profiles').select('*');
 * ```
 */
export async function createServiceRoleClient(secretKey: string): Promise<SupabaseClient<Database>> {
    if (!secretKey) {
        throw new Error(
            'Secret Key가 설정되지 않았습니다. ' +
            'SUPABASE_SECRET_KEY 또는 SUPABASE_SERVICE_ROLE_KEY 환경 변수를 확인하세요.'
        );
    }

    return createClient<Database>(supabaseUrl, secretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}


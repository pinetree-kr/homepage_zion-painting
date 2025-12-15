/**
 * Profile은 profiles 테이블의 데이터를 표현하는 모델입니다.
 * shared/lib/supabase-types.ts의 Profile을 기본으로 사용합니다.
 * 
 * - status: profiles 테이블의 status 필드 (user_status enum: 'pending' | 'approved' | 'rejected')
 * - 관리자 여부는 administrators 테이블을 조회하여 확인 (id가 auth.users.id와 1:1 매칭)
 * - 관리자 모드 접근 시 administrators 테이블에서 세부 권한('system' | 'contents')을 참조
 */
// import type { Profile } from '@/src/shared/lib/supabase-types';

// export type { Profile };

export interface Profile {
    id: string;
    name: string | null;
    email: string | null;
    // status: 'pending' | 'approved' | 'rejected' | null;
    metadata?: {
        last_login?: string | null;
        phone?: string | null;
        verified?: boolean;
        signup_provider?: string;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}
/**
 * User는 Profile의 별칭입니다.
 * Profile이자 User로 사용됩니다.
 */
export type User = Profile;

/**
 * Member는 Profile의 별칭입니다.
 * Profile이자 Member로 사용됩니다.
 */
export type Member = Profile;


// // administrators 테이블 타입 정의
// export interface Administrator {
//     id: string;
//     role: 'system' | 'contents';
//     created_at: string;
//     updated_at: string;
// }

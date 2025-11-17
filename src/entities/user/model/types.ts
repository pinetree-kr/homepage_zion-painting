/**
 * Profile은 profiles 테이블의 데이터를 표현하는 모델입니다.
 * shared/lib/supabase-types.ts의 Profile을 기본으로 사용합니다.
 * 
 * - role: profiles 테이블의 role 필드 (관리자 확인 용도: 'admin' | 'user')
 * - 관리자 모드 접근 시 administrators 테이블에서 세부 권한('system' | 'contents')을 참조
 */
import type { Profile } from '@/src/shared/lib/supabase-types';

export type { Profile };

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


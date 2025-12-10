'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createServiceRoleClient } from '@/src/shared/lib/supabase/service';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import type { Member } from '@/src/entities';

/**
 * 관리자 목록 조회 (검색 및 페이지네이션 지원, 관리자용)
 */
export async function searchAdminsUsingAdmin(
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Member[]; total: number; totalPages: number }> {
  const supabase = await createServerClient();
  return searchAdmins(supabase, searchTerm, page, itemsPerPage, sortColumn, sortDirection);
}

/**
 * 관리자 목록 조회 (검색 및 페이지네이션 지원, supabase 클라이언트 전달)
 */
export async function searchAdmins(
  supabase: SupabaseClient<Database>,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Member[]; total: number; totalPages: number }> {
  try {
    // 검색어가 있으면 프로필에서 먼저 검색하여 관리자 ID 목록을 얻음
    let adminIds: string[] | null = null;
    if (searchTerm.trim()) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .is('deleted_at', null);

      if (profiles && profiles.length > 0) {
        adminIds = profiles.map(p => p.id);
      } else {
        // 검색 결과가 없으면 빈 결과 반환
        return { data: [], total: 0, totalPages: 0 };
      }
    }

    // 관리자 테이블에서 조회
    let countQuery = supabase
      .from('administrators')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (adminIds) {
      countQuery = countQuery.in('id', adminIds);
    }

    // 전체 개수 조회
    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('관리자 개수 조회 오류:', countError);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let dataQuery = supabase
      .from('administrators')
      .select('id, role, created_at, updated_at')
      .is('deleted_at', null)
      .range(from, to);

    // 검색어가 있으면 관리자 ID 필터 적용
    if (adminIds) {
      dataQuery = dataQuery.in('id', adminIds);
    }

    // 정렬 적용
    if (sortColumn) {
      const columnMapping: Record<string, string> = {
        'name': 'id', // 프로필의 name으로 정렬하려면 별도 처리 필요
        'email': 'id', // 프로필의 email로 정렬하려면 별도 처리 필요
        'created_at': 'created_at',
        'last_login': 'id', // 프로필의 last_login으로 정렬하려면 별도 처리 필요
      };

      const dbColumn = columnMapping[sortColumn];
      if (dbColumn) {
        dataQuery = dataQuery.order(dbColumn, { ascending: sortDirection === 'asc' });
      } else {
        // 기본 정렬: created_at 내림차순
        dataQuery = dataQuery.order('created_at', { ascending: false });
      }
    } else {
      // 기본 정렬: created_at 내림차순
      dataQuery = dataQuery.order('created_at', { ascending: false });
    }

    const { data: admins, error } = await dataQuery as {
      data: any[] | null;
      error: any;
    };

    if (error) {
      console.error('관리자 로드 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    if (!admins || admins.length === 0) {
      return { data: [], total, totalPages };
    }

    // 관리자 ID 목록으로 프로필 조회
    const adminIdList = admins.map(a => a.id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, metadata, created_at, updated_at')
      .in('id', adminIdList)
      .is('deleted_at', null);

    // 프로필을 맵으로 변환
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    // 데이터 변환: 관리자와 프로필 데이터 결합
    const members: Member[] = admins.map((admin: any) => {
      const profile = profileMap.get(admin.id);
      const metadata = profile?.metadata as { phone?: string; last_login?: string; verified?: boolean; signup_provider?: string } | null;
      return {
        id: admin.id,
        name: profile?.name || null,
        email: profile?.email || null,
        metadata: metadata || null,
        created_at: admin.created_at || null,
        updated_at: admin.updated_at || null,
      };
    });

    // 클라이언트 사이드에서 정렬 (프로필 필드 정렬용)
    if (sortColumn && ['name', 'email', 'last_login'].includes(sortColumn)) {
      members.sort((a, b) => {
        let aValue: string | null = null;
        let bValue: string | null = null;

        if (sortColumn === 'name') {
          aValue = a.name;
          bValue = b.name;
        } else if (sortColumn === 'email') {
          aValue = a.email;
          bValue = b.email;
        } else if (sortColumn === 'last_login') {
          const aMetadata = a.metadata as { last_login?: string } | null;
          const bMetadata = b.metadata as { last_login?: string } | null;
          aValue = aMetadata?.last_login || null;
          bValue = bMetadata?.last_login || null;
        }

        const aStr = aValue || '';
        const bStr = bValue || '';

        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return {
      data: members,
      total,
      totalPages
    };
  } catch (error) {
    console.error('관리자 검색 중 예외 발생:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * 관리자 계정 생성
 * Secret Key를 사용하여 RLS 정책을 우회합니다.
 * 기존 관리자 존재 여부 체크 없이 새로운 관리자를 추가합니다.
 */
export async function createAdminAccount(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    // 서비스 롤 클라이언트로 회원가입 (auth.users에 사용자 생성)
    const supabase = await createServiceRoleClient(env.SUPABASE_SECRET_KEY);

    // 이메일 중복 확인 (profiles 테이블에서 확인)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingProfile) {
      return { success: false, error: '이미 존재하는 이메일입니다.' };
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 인증 없이 바로 활성화
      user_metadata: {
        name,
      },
    });

    console.log({ authData, authError })

    if (authError) {
      return {
        success: false,
        error: authError.message || '관리자 계정 생성에 실패했습니다.'
      };
    }

    if (!authData.user) {
      return { success: false, error: '관리자 계정 생성에 실패했습니다.' };
    }

    // profiles 테이블은 트리거(handle_new_user)에 의해 자동 생성됨
    // 트리거가 auth.users에 새 사용자가 생성될 때 자동으로 profiles 레코드를 생성합니다
    // 트리거가 생성한 후 잠시 대기 후 업데이트
    await new Promise(resolve => setTimeout(resolve, 500));

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        name: name,
        email: email,
      })
      .eq('id', authData.user.id);

    if (profileUpdateError) {
      console.error('프로필 업데이트 오류:', profileUpdateError);
      // 프로필 업데이트 실패해도 계속 진행
    }

    // administrators 테이블에 관리자 레코드 생성
    const { error: adminError } = await supabase
      .from('administrators')
      .insert({
        id: authData.user.id,
        role: 'system', // 기본값: system 관리자
      });

    if (adminError) {
      console.error('관리자 레코드 생성 오류:', adminError);
      return {
        success: false,
        error: '관리자 레코드 생성에 실패했습니다: ' + adminError.message
      };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/system/administrators');

    return { success: true };
  } catch (error) {
    console.error('관리자 계정 생성 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '관리자 계정 생성 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 관리자 정보 업데이트
 * Secret Key를 사용하여 RLS 정책을 우회합니다.
 * 이메일은 변경할 수 없습니다.
 */
export async function updateAdminAccount(
  id: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createServiceRoleClient(env.SUPABASE_SECRET_KEY);

    // auth.users의 user_metadata 업데이트
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        name: name,
      },
    });

    if (authUpdateError) {
      console.error('인증 정보 업데이트 오류:', authUpdateError);
      // user_metadata 업데이트 실패해도 계속 진행
    }

    // profiles 테이블 업데이트 (이메일은 변경하지 않음)
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        name: name,
      })
      .eq('id', id);

    if (profileUpdateError) {
      return {
        success: false,
        error: '프로필 업데이트에 실패했습니다: ' + profileUpdateError.message
      };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/system/administrators');

    return { success: true };
  } catch (error) {
    console.error('관리자 정보 업데이트 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '관리자 정보 업데이트 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 관리자 패스워드 초기화 이메일 발송
 * Secret Key를 사용하여 RLS 정책을 우회합니다.
 * Supabase를 통해 패스워드 리셋 링크가 포함된 이메일을 발송합니다.
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createServiceRoleClient(env.SUPABASE_SECRET_KEY);

    // 패스워드 리셋 링크 생성
    // generateLink를 호출하면 Supabase가 자동으로 이메일을 발송합니다
    // (Supabase 설정에 따라 자동 발송 여부가 결정됩니다)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${siteUrl}/auth/reset-password`,
      },
    });

    if (error) {
      return {
        success: false,
        error: '패스워드 초기화 이메일 발송에 실패했습니다: ' + error.message
      };
    }

    if (!data) {
      return {
        success: false,
        error: '패스워드 초기화 링크 생성에 실패했습니다.'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('패스워드 초기화 이메일 발송 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '패스워드 초기화 이메일 발송 중 오류가 발생했습니다.'
    };
  }
}


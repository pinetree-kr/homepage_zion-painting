'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { Profile } from '@/src/entities/user/model/types';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';

/**
 * 회원 목록 조회 (검색 및 페이지네이션 지원, 관리자용)
 */
export async function searchUsersUsingAdmin(
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10
): Promise<{ data: Profile[]; total: number; totalPages: number }> {
  const supabase = await createServerClient();
  return searchUsers(supabase, searchTerm, page, itemsPerPage);
}

/**
 * 회원 목록 조회 (검색 및 페이지네이션 지원, supabase 클라이언트 전달)
 */
export async function searchUsers(
  supabase: SupabaseClient<Database>,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10
): Promise<{ data: Profile[]; total: number; totalPages: number }> {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // 검색어가 있으면 이름, 이메일, 전화번호에서 검색
    if (searchTerm.trim()) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    // 전체 개수 조회
    const { count, error: countError } = await query;

    if (countError) {
      console.error('회원 개수 조회 오류:', countError);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let dataQuery = supabase
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    // 검색어가 있으면 이름, 이메일, 전화번호에서 검색
    if (searchTerm.trim()) {
      dataQuery = dataQuery.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    const { data, error } = await dataQuery as {
      data: Profile[] | null;
      error: any;
    };

    if (error) {
      console.error('회원 로드 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    return {
      data: data || [],
      total,
      totalPages
    };
  } catch (error) {
    console.error('회원 검색 중 예외 발생:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * 단일 회원 조회 (관리자용)
 */
export async function getUserUsingAdmin(id: string): Promise<Profile | null> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle() as {
        data: Profile | null;
        error: any;
      };

    if (error) {
      console.error('회원 조회 오류:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('회원 조회 중 예외 발생:', error);
    return null;
  }
}

/**
 * 회원 삭제 (soft delete)
 */
export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/customer/members');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


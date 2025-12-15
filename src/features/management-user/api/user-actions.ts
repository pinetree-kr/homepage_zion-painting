'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { Profile } from '@/src/entities/user/model/types';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import { getCurrentISOString } from '@/src/shared/lib/utils';

/**
 * 회원 목록 조회 (검색 및 페이지네이션 지원, 관리자용)
 */
export async function searchUsersUsingAdmin(
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Profile[]; total: number; totalPages: number }> {
  const supabase = await createServerClient();
  return searchUsers(supabase, searchTerm, page, itemsPerPage, sortColumn, sortDirection);
}

/**
 * 회원 목록 조회 (검색 및 페이지네이션 지원, supabase 클라이언트 전달)
 */
export async function searchUsers(
  supabase: SupabaseClient<Database>,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Profile[]; total: number; totalPages: number }> {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // 검색어가 있으면 이름, 이메일에서 검색 (phone은 metadata에 있으므로 별도 처리)
    if (searchTerm.trim()) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
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
      .range(from, to);

    // 검색어가 있으면 이름, 이메일에서 검색 (phone은 metadata에 있으므로 별도 처리)
    if (searchTerm.trim()) {
      dataQuery = dataQuery.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    // 정렬 적용
    if (sortColumn) {
      // 컬럼 ID를 DB 컬럼명으로 매핑
      const columnMapping: Record<string, string> = {
        'name': 'name',
        'email': 'email',
        'created_at': 'created_at',
        // phone과 last_login은 metadata에 있으므로 클라이언트 사이드 정렬
      };

      const dbColumn = columnMapping[sortColumn];
      if (dbColumn) {
        dataQuery = dataQuery
          .order(dbColumn, { ascending: sortDirection === 'asc' })
          .order('created_at', { ascending: false });
      } else {
        // 기본 정렬: created_at 내림차순
        dataQuery = dataQuery.order('created_at', { ascending: false });
      }
    } else {
      // 정렬이 없으면 기본 정렬: created_at 내림차순
      dataQuery = dataQuery.order('created_at', { ascending: false });
    }

    const { data, error } = await dataQuery as {
      data: Profile[] | null;
      error: any;
    };

    if (error) {
      console.error('회원 로드 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    // phone과 last_login은 metadata에 있으므로 클라이언트 사이드 정렬
    let sortedData = data || [];
    if (sortColumn && ['phone', 'last_login'].includes(sortColumn)) {
      sortedData = [...sortedData].sort((a, b) => {
        const aMetadata = a.metadata as { phone?: string; last_login?: string } | null;
        const bMetadata = b.metadata as { phone?: string; last_login?: string } | null;
        
        let aValue: string | null = null;
        let bValue: string | null = null;
        
        if (sortColumn === 'phone') {
          aValue = aMetadata?.phone || null;
          bValue = bMetadata?.phone || null;
        } else if (sortColumn === 'last_login') {
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
      data: sortedData,
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
      .update({ deleted_at: getCurrentISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/services/members');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


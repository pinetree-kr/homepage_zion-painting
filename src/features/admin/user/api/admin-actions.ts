'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
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
      .select('id, name, email, phone, last_login, created_at, updated_at')
      .in('id', adminIdList)
      .is('deleted_at', null);

    // 프로필을 맵으로 변환
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    // 데이터 변환: 관리자와 프로필 데이터 결합
    const members: Member[] = admins.map((admin: any) => {
      const profile = profileMap.get(admin.id);
      return {
        id: admin.id,
        name: profile?.name || null,
        email: profile?.email || null,
        phone: profile?.phone || null,
        last_login: profile?.last_login || null,
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
          aValue = a.last_login || null;
          bValue = b.last_login || null;
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


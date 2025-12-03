'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import type { Post } from '@/src/entities/post/model/types';
import type { Board } from '@/src/entities/board/model/types';

/**
 * 게시판 정보 조회 (관리자용)
 */
export async function getBoardInfoUsingAdmin(boardCode: string): Promise<Board | null> {
  const supabase = await createServerClient();
  return getBoardInfo(supabase, boardCode);
}

/**
 * 게시판 정보 조회 (익명 클라이언트 사용)
 */
export async function getBoardInfoUsingAnonymous(boardCode: string): Promise<Board | null> {
  const supabase = createAnonymousServerClient();
  return getBoardInfo(supabase, boardCode);
}

/**
 * 게시판 정보 조회 (supabase 클라이언트 전달)
 */
export async function getBoardInfo(supabase: SupabaseClient<Database>, boardCode: string): Promise<Board | null> {
  try {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('code', boardCode)
      .is('deleted_at', null)
      .maybeSingle() as {
        data: Board | null;
        error: any;
      };

    if (error) {
      console.error('게시판 조회 오류:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('게시판 조회 중 예외 발생:', error);
    return null;
  }
}

/**
 * 게시판 목록 조회 (관리자용, 검색, 페이징 및 정렬 지원)
 */
export async function getBoardsUsingAdmin(
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Board[]; total: number; totalPages: number }> {
  try {
    const supabase = await createServerClient();

    // 사용자 인증 상태 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('인증되지 않은 사용자입니다.');
    }

    // 관리자 여부 확인
    const { data: adminData, error: adminError } = await supabase
      .from('administrators')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (adminError || !adminData) {
      throw new Error('관리자 권한이 필요합니다.');
    }

    let countQuery = supabase
      .from('boards')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // 검색어가 있으면 코드, 이름, 설명에서 검색
    if (searchTerm.trim()) {
      countQuery = countQuery.or(`code.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // 전체 개수 조회
    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('게시판 개수 조회 오류:', countError);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from('boards')
      .select('*')
      .is('deleted_at', null)
      .range(from, to);

    // 검색어가 있으면 코드, 이름, 설명에서 검색
    if (searchTerm.trim()) {
      query = query.or(`code.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // 정렬 적용
    if (sortColumn) {
      const columnMapping: Record<string, string> = {
        'code': 'code',
        'name': 'name',
        'display_order': 'display_order',
        'created_at': 'created_at',
      };

      const dbColumn = columnMapping[sortColumn];
      if (dbColumn) {
        query = query.order(dbColumn, { ascending: sortDirection === 'asc' });
      } else {
        // 기본 정렬
        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
      }
    } else {
      // 기본 정렬
      query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
    }

    const { data, error } = await query as {
      data: Board[] | null;
      error: any;
    };

    if (error) {
      console.error('게시판 목록 조회 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    return {
      data: data || [],
      total,
      totalPages
    };
  } catch (error) {
    console.error('게시판 목록 조회 중 예외 발생:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * 게시판 생성 (관리자용)
 */
export async function createBoard(
  board: Omit<Board, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    // 사용자 인증 상태 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    // 관리자 여부 확인
    const { data: adminData, error: adminError } = await supabase
      .from('administrators')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (adminError || !adminData) {
      return { success: false, error: '관리자 권한이 필요합니다.' };
    }

    // 게시판 코드 중복 확인
    const { data: existingBoard } = await supabase
      .from('boards')
      .select('id')
      .eq('code', board.code)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingBoard) {
      return { success: false, error: '이미 존재하는 게시판 코드입니다.' };
    }

    const { data, error } = await supabase
      .from('boards')
      .insert({
        code: board.code,
        name: board.name,
        description: board.description || null,
        is_public: board.is_public,
        allow_anonymous: board.allow_anonymous,
        allow_comment: board.allow_comment,
        allow_file: board.allow_file,
        allow_guest: board.allow_guest,
        allow_secret: board.allow_secret,
        display_order: board.display_order || 0,
        allow_product_link: board.allow_product_link || false,
      })
      .select()
      .single();

    if (error) {
      console.error('게시판 생성 오류:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/system/boards');
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('게시판 생성 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 게시판 수정 (관리자용)
 */
export async function updateBoard(
  id: string,
  board: Partial<Omit<Board, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 사용자 인증 상태 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    // 관리자 여부 확인
    const { data: adminData, error: adminError } = await supabase
      .from('administrators')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (adminError || !adminData) {
      return { success: false, error: '관리자 권한이 필요합니다.' };
    }

    // 게시판 코드 중복 확인 (다른 게시판과 중복되지 않는지)
    if (board.code) {
      const { data: existingBoard } = await supabase
        .from('boards')
        .select('id')
        .eq('code', board.code)
        .neq('id', id)
        .is('deleted_at', null)
        .maybeSingle();

      if (existingBoard) {
        return { success: false, error: '이미 존재하는 게시판 코드입니다.' };
      }
    }

    const updateData: any = {};
    if (board.code !== undefined) updateData.code = board.code;
    if (board.name !== undefined) updateData.name = board.name;
    if (board.description !== undefined) updateData.description = board.description;
    if (board.is_public !== undefined) updateData.is_public = board.is_public;
    if (board.allow_anonymous !== undefined) updateData.allow_anonymous = board.allow_anonymous;
    if (board.allow_comment !== undefined) updateData.allow_comment = board.allow_comment;
    if (board.allow_file !== undefined) updateData.allow_file = board.allow_file;
    if (board.allow_guest !== undefined) updateData.allow_guest = board.allow_guest;
    if (board.allow_secret !== undefined) updateData.allow_secret = board.allow_secret;
    if (board.display_order !== undefined) updateData.display_order = board.display_order;
    if (board.allow_product_link !== undefined) updateData.allow_product_link = board.allow_product_link;

    const { error } = await supabase
      .from('boards')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('게시판 수정 오류:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/system/boards');
    // 게시판 연결 설정 페이지도 revalidate (allow_product_link 변경 시)
    if (board.allow_product_link !== undefined) {
      revalidatePath('/admin/sections/products/board-settings');
    }
    return { success: true };
  } catch (error: any) {
    console.error('게시판 수정 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 게시판 삭제 (soft delete, 관리자용)
 */
export async function deleteBoard(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 사용자 인증 상태 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    // 관리자 여부 확인
    const { data: adminData, error: adminError } = await supabase
      .from('administrators')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (adminError || !adminData) {
      return { success: false, error: '관리자 권한이 필요합니다.' };
    }

    const { error } = await supabase
      .from('boards')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      console.error('게시판 삭제 오류:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/system/boards');
    return { success: true };
  } catch (error: any) {
    console.error('게시판 삭제 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 제품 목록 조회 (관리자용)
 */
export async function getProductsUsingAdmin(
  limit: number = 100
): Promise<Array<{ id: string; title: string }>> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('id, title')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('제품 목록 조회 오류:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title
    }));
  } catch (error) {
    console.error('제품 목록 조회 중 예외 발생:', error);
    return [];
  }
}

/**
 * 제품 목록 조회 (익명 클라이언트 사용)
 */
export async function getProductsUsingAnonymous(
  limit: number = 100
): Promise<Array<{ id: string; title: string }>> {
  try {
    const supabase = createAnonymousServerClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('id, title')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('제품 목록 조회 오류:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title
    }));
  } catch (error) {
    console.error('제품 목록 조회 중 예외 발생:', error);
    return [];
  }
}

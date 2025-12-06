'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import type { Post } from '@/src/entities/post/model/types';
import type { Board, BoardPolicy, VisibleType, AppRole } from '@/src/entities/board/model/types';
import { logBoardPermissionChange, logBoardUpdate } from '@/src/entities/system';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';
import { headers } from 'next/headers';

/**
 * 게시판 정보 조회 (관리자용)
 */
export async function getBoardInfoUsingAdmin(boardCode: string): Promise<Board | null> {
  const supabase = await createServerClient();
  return getBoardInfo(supabase, boardCode);
}

export async function getBoardInfoUsingAdminById(boardId: string): Promise<Board | null> {
  const supabase = await createServerClient();
  return getBoardInfoById(supabase, boardId);
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
 * 게시판 정보 조회 (supabase 클라이언트 전달)
 */
export async function getBoardInfoById(supabase: SupabaseClient<Database>, boardId: string): Promise<Board | null> {
  try {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
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
 * 게시판 정보 조회 (ID로 조회, 일반 사용자용 - 익명 클라이언트)
 */
export async function getBoardInfoByIdUsingAnonymous(boardId: string): Promise<Board | null> {
  const supabase = createAnonymousServerClient();
  return getBoardInfoById(supabase, boardId);
}

/**
 * 게시판 정보 조회 (ID로 조회, 관리자용)
 */
export async function getBoardByIdUsingAdmin(boardId: string): Promise<Board | null> {
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

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
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
        'created_at': 'created_at',
      };

      const dbColumn = columnMapping[sortColumn];
      if (dbColumn) {
        query = query.order(dbColumn, { ascending: sortDirection === 'asc' });
      } else {
        // 기본 정렬
        query = query.order('created_at', { ascending: false });
      }
    } else {
      // 기본 정렬
      query = query.order('created_at', { ascending: false });
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
 * 게시판 권한 정책 조회 (관리자용)
 */
export async function getBoardPolicies(boardId: string): Promise<BoardPolicy[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('board_policies')
      .select('*')
      .eq('board_id', boardId);

    if (error) {
      console.error('권한 정책 조회 오류:', error);
      return [];
    }

    return (data || []) as BoardPolicy[];
  } catch (error) {
    console.error('권한 정책 조회 중 예외 발생:', error);
    return [];
  }
}

/**
 * 게시판 권한 정책 조회 (일반 사용자용 - 익명 클라이언트)
 */
export async function getBoardPoliciesUsingAnonymous(boardId: string): Promise<BoardPolicy[]> {
  try {
    const supabase = createAnonymousServerClient();

    const { data, error } = await supabase
      .from('board_policies')
      .select('*')
      .eq('board_id', boardId);

    if (error) {
      console.error('권한 정책 조회 오류:', error);
      return [];
    }

    return (data || []) as BoardPolicy[];
  } catch (error) {
    console.error('권한 정책 조회 중 예외 발생:', error);
    return [];
  }
}

/**
 * 게시판 권한 정책 저장 (관리자용)
 */
export async function saveBoardPolicies(
  boardId: string,
  policies: Omit<BoardPolicy, 'board_id' | 'created_at' | 'updated_at'>[]
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

    // 게시판 정보 가져오기 (로그용)
    const { data: boardData } = await supabase
      .from('boards')
      .select('name')
      .eq('id', boardId)
      .single();

    const boardName = boardData?.name || '알 수 없음';

    // 기존 정책 가져오기 (변경 전후 비교용)
    const { data: oldPolicies } = await supabase
      .from('board_policies')
      .select('*')
      .eq('board_id', boardId);

    // 기존 정책 삭제
    const { error: deleteError } = await supabase
      .from('board_policies')
      .delete()
      .eq('board_id', boardId);

    if (deleteError) {
      console.error('기존 정책 삭제 오류:', deleteError);
      return { success: false, error: deleteError.message };
    }

    // 새 정책 삽입
    const policiesToInsert = policies.map(policy => ({
      board_id: boardId,
      role: policy.role,
      post_list: policy.post_list,
      post_create: policy.post_create,
      post_read: policy.post_read,
      post_edit: policy.post_edit,
      post_delete: policy.post_delete,
      cmt_create: policy.cmt_create,
      cmt_read: policy.cmt_read,
      cmt_edit: policy.cmt_edit,
      cmt_delete: policy.cmt_delete,
      file_upload: policy.file_upload,
      file_download: policy.file_download,
    }));

    const { error: insertError } = await supabase
      .from('board_policies')
      .insert(policiesToInsert);

    if (insertError) {
      console.error('권한 정책 저장 오류:', insertError);
      return { success: false, error: insertError.message };
    }

    // 활동 로그 기록 (권한 변경)
    try {
      const userProfile = await getCurrentUserProfile();
      if (userProfile) {
        // IP 주소 가져오기
        let ipAddress: string | null = null;
        try {
          const headersList = await headers();
          const forwardedFor = headersList.get('x-forwarded-for');
          const realIp = headersList.get('x-real-ip');
          const cfConnectingIp = headersList.get('cf-connecting-ip');

          if (forwardedFor) {
            ipAddress = forwardedFor.split(',')[0].trim();
          } else if (realIp) {
            ipAddress = realIp;
          } else if (cfConnectingIp) {
            ipAddress = cfConnectingIp;
          }
        } catch (ipError) {
          console.error('IP 주소 가져오기 실패:', ipError);
        }

        // 변경된 권한 정보 비교
        const changedRoles: string[] = [];
        const permissionChanges: Record<string, { role: string; before: any; after: any }> = {};

        // 기존 정책과 새 정책 비교
        policies.forEach(newPolicy => {
          const oldPolicy = oldPolicies?.find(p => p.role === newPolicy.role);

          if (!oldPolicy) {
            // 새로 추가된 역할
            changedRoles.push(newPolicy.role);
            permissionChanges[newPolicy.role] = {
              role: newPolicy.role,
              before: null,
              after: newPolicy
            };
          } else {
            // 권한 변경 확인
            const hasChanges =
              oldPolicy.post_list !== newPolicy.post_list ||
              oldPolicy.post_create !== newPolicy.post_create ||
              oldPolicy.post_read !== newPolicy.post_read ||
              oldPolicy.post_edit !== newPolicy.post_edit ||
              oldPolicy.post_delete !== newPolicy.post_delete ||
              oldPolicy.cmt_create !== newPolicy.cmt_create ||
              oldPolicy.cmt_read !== newPolicy.cmt_read ||
              oldPolicy.cmt_edit !== newPolicy.cmt_edit ||
              oldPolicy.cmt_delete !== newPolicy.cmt_delete ||
              oldPolicy.file_upload !== newPolicy.file_upload ||
              oldPolicy.file_download !== newPolicy.file_download;

            if (hasChanges) {
              changedRoles.push(newPolicy.role);
              permissionChanges[newPolicy.role] = {
                role: newPolicy.role,
                before: oldPolicy,
                after: newPolicy
              };
            }
          }
        });

        // 삭제된 역할 확인
        oldPolicies?.forEach(oldPolicy => {
          const exists = policies.find(p => p.role === oldPolicy.role);
          if (!exists) {
            changedRoles.push(oldPolicy.role);
            permissionChanges[oldPolicy.role] = {
              role: oldPolicy.role,
              before: oldPolicy,
              after: null
            };
          }
        });

        // 변경사항이 있는 경우에만 로그 기록
        if (changedRoles.length > 0) {
          await logBoardPermissionChange(
            userProfile.id,
            userProfile.name || '알 수 없음',
            boardName,
            changedRoles,
            permissionChanges,
            ipAddress
          );
        }
      }
    } catch (logError) {
      // 로그 기록 실패해도 권한 저장은 성공으로 처리
      console.error('게시판 권한 변경 로그 기록 실패:', logError);
    }

    return { success: true };
  } catch (error: any) {
    console.error('권한 정책 저장 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 게시판 생성 (관리자용)
 */
export async function createBoard(
  board: Omit<Board, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  policies?: Omit<BoardPolicy, 'board_id' | 'created_at' | 'updated_at'>[]
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
        visibility: board.visibility || 'public',
      })
      .select()
      .single();

    if (error) {
      console.error('게시판 생성 오류:', error);
      return { success: false, error: error.message };
    }

    // 권한 정책 저장
    if (policies && policies.length > 0) {
      const policyResult = await saveBoardPolicies(data.id, policies);
      if (!policyResult.success) {
        // 게시판은 생성되었지만 정책 저장 실패 - 롤백은 하지 않고 경고만
        console.warn('게시판은 생성되었지만 권한 정책 저장에 실패했습니다:', policyResult.error);
      }
    } else {
      // 기본 정책 생성 (admin과 member 모두 모든 권한 허용)
      const defaultPolicies: Omit<BoardPolicy, 'board_id' | 'created_at' | 'updated_at'>[] = [
        {
          role: 'admin',
          post_list: true,
          post_create: true,
          post_read: true,
          post_edit: true,
          post_delete: true,
          cmt_create: true,
          cmt_read: true,
          cmt_edit: true,
          cmt_delete: true,
          file_upload: true,
          file_download: true,
        },
        {
          role: 'member',
          post_list: true,
          post_create: true,
          post_read: true,
          post_edit: true,
          post_delete: true,
          cmt_create: true,
          cmt_read: true,
          cmt_edit: true,
          cmt_delete: true,
          file_upload: true,
          file_download: true,
        },
      ];
      await saveBoardPolicies(data.id, defaultPolicies);
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
  board: Partial<Omit<Board, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>,
  policies?: Omit<BoardPolicy, 'board_id' | 'created_at' | 'updated_at'>[]
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

    // 기존 게시판 정보 가져오기 (변경 전후 비교 및 로그용)
    const { data: oldBoardData } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldBoardData) {
      return { success: false, error: '게시판을 찾을 수 없습니다.' };
    }

    const boardName = oldBoardData.name || '알 수 없음';

    // 변경될 필드 확인 (실제로 변경된 필드만 업데이트)
    const updateData: any = {};
    const changedFields: string[] = [];

    if (board.code !== undefined && board.code !== oldBoardData.code) {
      updateData.code = board.code;
      changedFields.push('code');
    }
    if (board.name !== undefined && board.name !== oldBoardData.name) {
      updateData.name = board.name;
      changedFields.push('name');
    }
    if (board.description !== undefined && board.description !== oldBoardData.description) {
      updateData.description = board.description;
      changedFields.push('description');
    }
    if (board.visibility !== undefined && board.visibility !== oldBoardData.visibility) {
      updateData.visibility = board.visibility;
      changedFields.push('visibility');
    }

    // 게시판 정보 변경이 있는 경우에만 업데이트
    let boardInfoChanged = false;
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('boards')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('게시판 수정 오류:', error);
        return { success: false, error: error.message };
      }
      boardInfoChanged = true;
    }

    // 권한 정책 저장 (권한 변경 로그는 saveBoardPolicies에서 기록)
    let permissionChanged = false;
    if (policies && policies.length > 0) {
      const policyResult = await saveBoardPolicies(id, policies);
      if (!policyResult.success) {
        console.warn('게시판은 수정되었지만 권한 정책 저장에 실패했습니다:', policyResult.error);
        return { success: false, error: policyResult.error };
      }
      permissionChanged = true;
    }

    // 게시판 정보 변경 로그 기록 (권한 변경과 별도로, 변경사항이 있을 때만)
    if (boardInfoChanged) {
      try {
        const userProfile = await getCurrentUserProfile();
        if (userProfile) {
          // IP 주소 가져오기
          let ipAddress: string | null = null;
          try {
            const headersList = await headers();
            const forwardedFor = headersList.get('x-forwarded-for');
            const realIp = headersList.get('x-real-ip');
            const cfConnectingIp = headersList.get('cf-connecting-ip');

            if (forwardedFor) {
              ipAddress = forwardedFor.split(',')[0].trim();
            } else if (realIp) {
              ipAddress = realIp;
            } else if (cfConnectingIp) {
              ipAddress = cfConnectingIp;
            }
          } catch (ipError) {
            console.error('IP 주소 가져오기 실패:', ipError);
          }

          // 게시판 정보 변경 로그 기록
          await logBoardUpdate(
            userProfile.id,
            userProfile.name || '알 수 없음',
            boardName,
            ipAddress
          );
        }
      } catch (logError) {
        // 로그 기록 실패해도 업데이트는 성공으로 처리
        console.error('게시판 정보 변경 로그 기록 실패:', logError);
      }
    }

    revalidatePath('/admin/system/boards');
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
      .update({ deleted_at: new Date().toISOString() })
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

/**
 * board_id를 기반으로 제품 연결 가능 여부 확인 (일반 사용자용 - 익명 클라이언트)
 * site_settings의 default_boards에서 review나 quote로 지정된 board_id인지 확인
 */
export async function checkBoardSupportsProductLinkingUsingAnonymous(boardId: string): Promise<boolean> {
  try {
    const supabase = createAnonymousServerClient();

    // site_settings에서 default_boards 조회
    const { data: siteSettingsData, error: siteSettingsError } = await supabase
      .from('site_settings')
      .select('review_board_id:default_boards->review->id, quote_board_id:default_boards->quote->id')
      .is('deleted_at', null)
      .maybeSingle();

    if (siteSettingsError || !siteSettingsData) {
      console.error('site_settings 조회 오류:', siteSettingsError);
      return false;
    }

    const reviewBoardId = siteSettingsData.review_board_id;
    const quoteBoardId = siteSettingsData.quote_board_id;

    return (reviewBoardId === boardId) || (quoteBoardId === boardId);
  } catch (error) {
    console.error('제품 연결 가능 여부 확인 중 오류:', error);
    return false;
  }
}

/**
 * board_id를 기반으로 제품 연결 가능 여부 확인 (관리자용)
 * site_settings의 default_boards에서 review나 quote로 지정된 board_id인지 확인
 */
export async function checkBoardSupportsProductLinking(boardId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    // site_settings에서 default_boards 조회
    const { data: siteSettingsData, error: siteSettingsError } = await supabase
      .from('site_settings')
      .select('default_boards')
      .is('deleted_at', null)
      .maybeSingle();

    if (siteSettingsError || !siteSettingsData) {
      console.error('site_settings 조회 오류:', siteSettingsError);
      return false;
    }

    const defaultBoards = siteSettingsData.default_boards as any;
    if (!defaultBoards) {
      return false;
    }

    // review나 quote로 지정된 board_id인지 확인
    const reviewBoardId = defaultBoards.review?.id;
    const quoteBoardId = defaultBoards.quote?.id;

    return (reviewBoardId === boardId) || (quoteBoardId === boardId);
  } catch (error) {
    console.error('제품 연결 가능 여부 확인 중 오류:', error);
    return false;
  }
}

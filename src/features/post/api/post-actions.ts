'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import type { Post } from '@/src/entities/post/model/types';

/**
 * 게시판 코드로 게시글 목록 조회 (검색 및 페이지네이션 지원, 관리자용)
 */
export async function searchPostsByBoardCodeUsingAdmin(
  boardCode: string,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Post[]; total: number; totalPages: number }> {
  const supabase = await createServerClient();
  return searchPostsByBoardCode(supabase, boardCode, searchTerm, page, itemsPerPage, sortColumn, sortDirection);
}

/**
 * 게시판 코드로 게시글 목록 조회 (검색 및 페이지네이션 지원, supabase 클라이언트 전달)
 */
export async function searchPostsByBoardCode(
  supabase: SupabaseClient<Database>,
  boardCode: string,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Post[]; total: number; totalPages: number }> {
  try {
    // 먼저 board_id를 가져옵니다
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('code', boardCode)
      .single();

    if (boardError || !board) {
      console.error('게시판 조회 오류:', boardError);
      return { data: [], total: 0, totalPages: 0 };
    }

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('board_id', board.id)
      .is('deleted_at', null);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 전체 개수 조회
    const { count, error: countError } = await query;

    if (countError) {
      console.error('게시글 개수 조회 오류:', countError);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let dataQuery = supabase
      .from('posts')
      .select('*')
      .eq('board_id', board.id)
      .is('deleted_at', null)
      .range(from, to);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      dataQuery = dataQuery.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 정렬 적용
    // 고정 게시글은 항상 먼저 표시
    dataQuery = dataQuery.order('is_pinned', { ascending: false });
    
    if (sortColumn) {
      // 컬럼 ID를 DB 컬럼명으로 매핑
      const columnMapping: Record<string, string> = {
        'title': 'title',
        'author': 'author_name',
        'status': 'status',
        'created_at': 'created_at',
        'view_count': 'view_count',
        'like_count': 'like_count',
        'comment_count': 'comment_count',
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
      data: Post[] | null;
      error: any;
    };

    if (error) {
      console.error('게시글 로드 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    return {
      data: data || [],
      total,
      totalPages
    };
  } catch (error) {
    console.error('게시글 검색 중 예외 발생:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * 단일 게시글 조회 (관리자용)
 */
export async function getPostUsingAdmin(id: string): Promise<Post | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle() as {
        data: Post | null;
        error: any;
      };

    if (error) {
      console.error('게시글 조회 오류:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('게시글 조회 중 예외 발생:', error);
    return null;
  }
}

/**
 * HTML에서 텍스트만 추출하고 길이를 제한합니다.
 */
function stripHtmlAndTruncate(html: string, maxLength: number = 50): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // HTML 태그 제거
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  // 길이 제한
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
  }

  return text;
}

/**
 * 게시글 저장
 */
export async function savePost(
  post: Omit<Post, 'id' | 'view_count' | 'like_count' | 'comment_count' | 'created_at' | 'updated_at' | 'deleted_at'> & {
    id?: string | null;
    boardCode: 'notices' | 'qna' | 'quotes' | 'reviews';
  }
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

    // 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, phone')
      .eq('id', user.id)
      .single();

    // board_id 가져오기
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('code', post.boardCode)
      .single();

    if (boardError || !board) {
      return { success: false, error: '게시판을 찾을 수 없습니다.' };
    }

    // content_summary 자동 생성
    const contentSummary = stripHtmlAndTruncate(post.content || '', 50);

    const postData: any = {
      board_id: board.id,
      category_id: post.category_id || null,
      title: post.title || '',
      content: post.content || '',
      content_summary: contentSummary,
      author_id: user.id,
      author_name: post.author_name || profile?.name || null,
      author_email: post.author_email || profile?.email || null,
      author_phone: post.author_phone || profile?.phone || null,
      status: post.status || 'draft',
      is_pinned: post.is_pinned || false,
      is_secret: post.is_secret || false,
      thumbnail_url: post.thumbnail_url || null,
      extra_json: post.extra_json || null,
    };

    if (post.id) {
      // 업데이트
      const { error, data } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', post.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      // const revalidatePathValue = post.boardCode === 'quotes' ? '/admin/customer/estimates' : `/admin/customer/${post.boardCode}`;
      const revalidatePathValue = `/admin/boards/${post.boardCode}`;
      revalidatePath(revalidatePathValue);
      revalidatePath(`${revalidatePathValue}/${post.id}`);

      return { success: true, id: data.id };
    } else {
      // 새로 생성
      const { error, data } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error('게시글 생성 오류:', error);
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      // const revalidatePathValue = post.boardCode === 'quote' ? '/admin/customer/estimates' : `/admin/customer/${post.boardCode}`;
      const revalidatePathValue = `/admin/boards/${post.boardCode}`;
      revalidatePath(revalidatePathValue);

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    console.error('게시글 저장 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 게시글 삭제 (soft delete)
 */
export async function deletePost(id: string, boardCode: 'notices' | 'qna' | 'quotes' | 'reviews'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    const revalidatePathValue = `/admin/boards/${boardCode}`;
    revalidatePath(revalidatePathValue);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import type { Comment } from '@/src/entities/comment/model/types';
import { getCurrentISOString } from '@/src/shared/lib/utils';

/**
 * 게시글의 댓글 목록 조회 (관리자용)
 */
export async function getCommentsByPostId(postId: string): Promise<(Comment & { profile_name?: string | null })[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:author_id (
          name
        )
      `)
      .eq('post_id', postId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('댓글 조회 오류:', error);
      return [];
    }

    // profiles 조인 결과를 평탄화 (profiles는 단일 객체 또는 배열일 수 있음)
    return (data || []).map((comment: any) => {
      const profile = Array.isArray(comment.profiles) 
        ? comment.profiles[0] 
        : comment.profiles;
      
      return {
        ...comment,
        profile_name: profile?.name || null,
        profiles: undefined, // 원본 profiles 객체 제거
      };
    }) as (Comment & { profile_name?: string | null })[];
  } catch (error) {
    console.error('댓글 조회 중 예외 발생:', error);
    return [];
  }
}

/**
 * 댓글 생성 (관리자용)
 */
export async function createComment(
  postId: string,
  context: string,
  authorName?: string
): Promise<{ success: boolean; error?: string; data?: Comment }> {
  try {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    let profileName: string | null = null;
    if (user?.id) {
      // profiles 테이블에서 name 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      
      profileName = profile?.name || null;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        context,
        author_id: user?.id || null,
        author_name: authorName || profileName || '익명',
        status: 'published',
      })
      .select()
      .single() as {
        data: Comment | null;
        error: any;
      };

    if (error) {
      console.error('댓글 생성 오류:', error);
      return { success: false, error: error.message || '댓글 생성에 실패했습니다.' };
    }

    return { success: true, data: data || undefined };
  } catch (error: any) {
    console.error('댓글 생성 중 예외 발생:', error);
    return { success: false, error: error.message || '댓글 생성에 실패했습니다.' };
  }
}

/**
 * 댓글 삭제 (관리자 또는 작성자만 가능)
 */
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 댓글 정보 조회
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single();

    if (commentError || !comment) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' };
    }

    // 관리자 여부 확인
    const { data: adminData } = await supabase
      .from('administrators')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    const isAdmin = adminData !== null;
    const isAuthor = comment.author_id === user.id;

    // 권한 확인: 관리자 또는 작성자만 삭제 가능
    if (!isAdmin && !isAuthor) {
      return { success: false, error: '댓글을 삭제할 권한이 없습니다.' };
    }

    // 소프트 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .update({ deleted_at: getCurrentISOString() })
      .eq('id', commentId);

    if (deleteError) {
      console.error('댓글 삭제 오류:', deleteError);
      return { success: false, error: deleteError.message || '댓글 삭제에 실패했습니다.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('댓글 삭제 중 예외 발생:', error);
    return { success: false, error: error.message || '댓글 삭제에 실패했습니다.' };
  }
}

/**
 * 댓글 수정 (작성자만 가능)
 */
export async function updateComment(
  commentId: string,
  context: string
): Promise<{ success: boolean; error?: string; data?: Comment }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 댓글 정보 조회
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single();

    if (commentError || !comment) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' };
    }

    // 작성자만 수정 가능
    if (comment.author_id !== user.id) {
      return { success: false, error: '댓글을 수정할 권한이 없습니다.' };
    }

    // HTML 태그를 제거하고 텍스트만 추출하여 확인
    const textContent = context.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      return { success: false, error: '댓글 내용을 입력해주세요.' };
    }

    // 댓글 수정
    const { data, error: updateError } = await supabase
      .from('comments')
      .update({
        context,
        updated_at: getCurrentISOString(),
      })
      .eq('id', commentId)
      .select()
      .single() as {
        data: Comment | null;
        error: any;
      };

    if (updateError) {
      console.error('댓글 수정 오류:', updateError);
      return { success: false, error: updateError.message || '댓글 수정에 실패했습니다.' };
    }

    return { success: true, data: data || undefined };
  } catch (error: any) {
    console.error('댓글 수정 중 예외 발생:', error);
    return { success: false, error: error.message || '댓글 수정에 실패했습니다.' };
  }
}


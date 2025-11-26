'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import type { Comment } from '@/src/entities/comment/model/types';

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


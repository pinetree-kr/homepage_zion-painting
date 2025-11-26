'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';

export interface PostFile {
  id: string;
  post_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * 게시물에 첨부된 파일 목록 조회
 */
export async function getPostFiles(postId: string): Promise<PostFile[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('post_files')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('파일 목록 조회 오류:', error);
      return [];
    }

    return (data as PostFile[]) || [];
  } catch (error) {
    console.error('파일 목록 조회 중 예외 발생:', error);
    return [];
  }
}

/**
 * 게시물 파일 저장
 */
export async function savePostFiles(
  postId: string,
  files: Array<{
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    if (files.length === 0) {
      return { success: true };
    }

    const fileData = files.map((file) => ({
      post_id: postId,
      file_url: file.file_url,
      file_name: file.file_name,
      file_size: file.file_size,
      mime_type: file.mime_type,
    }));

    const { error } = await supabase.from('post_files').insert(fileData);

    if (error) {
      console.error('파일 저장 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('파일 저장 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 게시물 파일 삭제
 */
export async function deletePostFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('post_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('파일 삭제 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('파일 삭제 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 게시물의 모든 파일 삭제
 */
export async function deleteAllPostFiles(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('post_files')
      .delete()
      .eq('post_id', postId);

    if (error) {
      console.error('파일 삭제 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('파일 삭제 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


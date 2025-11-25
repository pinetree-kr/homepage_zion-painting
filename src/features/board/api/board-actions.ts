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

    console.log({ data, boardCode })

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

"use server"

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { LogType } from './types';

interface CreateActivityLogParams {
  userId?: string | null;
  userName: string;
  logType: LogType;
  action: string;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * 활동 로그 생성 (서버 사이드)
 * 
 * 사용 예시:
 * ```ts
 * await createActivityLog({
 *   userId: user.id,
 *   userName: user.name,
 *   logType: 'ADMIN_LOGIN',
 *   action: '관리자 로그인',
 *   details: '관리자 페이지 로그인 성공',
 *   ipAddress: request.headers.get('x-forwarded-for'),
 * });
 * ```
 */
export async function createActivityLog(params: CreateActivityLogParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: params.userId || null,
        user_name: params.userName,
        log_type: params.logType,
        action: params.action,
        details: params.details,
        metadata: params.metadata || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      });

    if (error) {
      console.error('활동 로그 생성 오류:', error);
      return { success: false, error: error.message };
    }

    // 통계 캐시 무효화
    // 페이지 레벨 캐싱을 사용하므로 revalidatePath로 페이지 캐시 무효화
    try {
      revalidatePath('/admin/system/logs');
    } catch (cacheError) {
      // 캐시 무효화 실패해도 로그 생성은 성공으로 처리
      console.warn('페이지 캐시 무효화 실패:', cacheError);
    }

    return { success: true };
  } catch (error) {
    console.error('활동 로그 생성 중 예외 발생:', error);
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
  }
}

/**
 * 사용자 가입 로그 생성
 */
export async function logUserSignup(userId: string, userName: string, ipAddress?: string | null) {
  return createActivityLog({
    userId,
    userName,
    logType: 'USER_SIGNUP',
    action: '사용자 가입',
    details: '일반 사용자 가입 완료',
    ipAddress,
  });
}

/**
 * 관리자 가입 로그 생성
 */
export async function logAdminSignup(userId: string, userName: string, ipAddress?: string | null) {
  return createActivityLog({
    userId,
    userName,
    logType: 'ADMIN_SIGNUP',
    action: '관리자 가입',
    details: '새 관리자 계정 생성',
    ipAddress,
  });
}

/**
 * 로그인 실패 로그 생성
 */
export async function logLoginFailed(userName: string, ipAddress?: string | null) {
  return createActivityLog({
    userName,
    logType: 'LOGIN_FAILED',
    action: '로그인 실패',
    details: '잘못된 비밀번호로 로그인 시도',
    ipAddress,
  });
}

/**
 * 관리자 로그인 로그 생성
 */
export async function logAdminLogin(userId: string, userName: string, ipAddress?: string | null) {
  return createActivityLog({
    userId,
    userName,
    logType: 'ADMIN_LOGIN',
    action: '관리자 로그인',
    details: '관리자 페이지 로그인 성공',
    ipAddress,
  });
}

/**
 * 섹션 설정 변경 로그 생성
 */
export async function logSectionSettingChange(
  userId: string,
  userName: string,
  sectionName: string,
  beforeValue: string,
  afterValue: string,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId,
    userName,
    logType: 'SECTION_SETTING_CHANGE',
    action: '섹션 설정 변경',
    details: `${sectionName} 섹션 설정 변경`,
    metadata: {
      sectionName,
      beforeValue,
      afterValue,
    },
    ipAddress,
  });
}

/**
 * 게시판 생성 로그 생성
 */
export async function logBoardCreate(
  userId: string,
  userName: string,
  boardName: string,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId,
    userName,
    logType: 'BOARD_CREATE',
    action: '게시판 생성',
    details: `새 게시판 생성: ${boardName}`,
    metadata: {
      boardName,
    },
    ipAddress,
  });
}

/**
 * 게시판 수정 로그 생성
 */
export async function logBoardUpdate(
  userId: string,
  userName: string,
  boardName: string,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId,
    userName,
    logType: 'BOARD_UPDATE',
    action: '게시판 수정',
    details: `게시판 설정 수정: ${boardName}`,
    metadata: {
      boardName,
    },
    ipAddress,
  });
}

/**
 * 게시판 삭제 로그 생성
 */
export async function logBoardDelete(
  userId: string,
  userName: string,
  boardName: string,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId,
    userName,
    logType: 'BOARD_DELETE',
    action: '게시판 삭제',
    details: `게시판 삭제: ${boardName}`,
    metadata: {
      boardName,
    },
    ipAddress,
  });
}

/**
 * 게시글 작성 로그 생성
 */
export async function logPostCreate(
  userId: string,
  userName: string,
  boardName: string,
  postId: string,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId,
    userName,
    logType: 'POST_CREATE',
    action: '게시글 작성',
    details: `${boardName} 게시글 작성 완료`,
    metadata: {
      boardName,
      postId,
    },
    ipAddress,
  });
}

/**
 * 관리자 답변 로그 생성
 */
export async function logPostAnswer(
  userId: string,
  userName: string,
  boardName: string,
  postId: string,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId,
    userName,
    logType: 'POST_ANSWER',
    action: '관리자 답변',
    details: `${boardName} 게시글에 답변 작성`,
    metadata: {
      boardName,
      postId,
    },
    ipAddress,
  });
}

/**
 * 게시판 권한 변경 로그 생성
 */
export async function logBoardPermissionChange(
  userId: string,
  userName: string,
  boardName: string,
  changedRoles: string[],
  permissionChanges: Record<string, { role: string; before: any; after: any }>,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId,
    userName,
    logType: 'BOARD_UPDATE',
    action: '게시판 권한 변경',
    details: `${boardName} 게시판의 권한 설정 변경`,
    metadata: {
      boardName,
      changedRoles,
      permissionChanges,
    },
    ipAddress,
  });
}

/**
 * 오류 로그 생성
 */
export async function logError(
  userId: string | null,
  userName: string,
  errorMessage: string,
  details?: string,
  ipAddress?: string | null
) {
  return createActivityLog({
    userId: userId || null,
    userName,
    logType: 'ERROR',
    action: '오류 발생',
    details: details || '시스템 오류 발생',
    metadata: {
      errorMessage,
    },
    ipAddress,
  });
}


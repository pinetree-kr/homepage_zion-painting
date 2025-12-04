"use server"

import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/shared/lib/supabase-types';
import type { ActivityLog, LogType } from './types';

// DB에서 가져온 activity_logs Row 타입
interface ActivityLogRow {
  id: string;
  user_id: string | null;
  user_name: string;
  log_type: string;
  action: string;
  details: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// DB Row를 ActivityLog 타입으로 변환
function mapRowToActivityLog(row: ActivityLogRow): ActivityLog {
  return {
    id: row.id,
    userId: row.user_id || '',
    userName: row.user_name,
    logType: row.log_type as LogType,
    action: row.action,
    details: row.details || '',
    timestamp: row.created_at,
    ipAddress: row.ip_address || undefined,
    metadata: row.metadata || undefined,
  };
}

/**
 * 활동 로그 조회 (관리자용)
 */
export async function getActivityLogsUsingAdmin(
  searchQuery: string = '',
  logTypeFilter: string = 'all',
  dateFilter: string = 'all',
  page: number = 1,
  itemsPerPage: number = 50
): Promise<{ data: ActivityLog[]; total: number }> {
  const supabase = await createServerClient();
  return getActivityLogs(supabase, searchQuery, logTypeFilter, dateFilter, page, itemsPerPage);
}

/**
 * 활동 로그 조회 (supabase 클라이언트 전달)
 */
export async function getActivityLogs(
  supabase: SupabaseClient<Database>,
  searchQuery: string = '',
  logTypeFilter: string = 'all',
  dateFilter: string = 'all',
  page: number = 1,
  itemsPerPage: number = 50
): Promise<{ data: ActivityLog[]; total: number }> {
  try {
    // 기본 쿼리
    let query = supabase
      .from('activity_logs' as any)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // 로그 타입 필터
    if (logTypeFilter !== 'all') {
      query = query.eq('log_type', logTypeFilter);
    }

    // 날짜 필터
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    // 검색어 필터 (사용자명, 작업, 상세 내용에서 검색)
    if (searchQuery.trim()) {
      query = query.or(
        `user_name.ilike.%${searchQuery}%,action.ilike.%${searchQuery}%,details.ilike.%${searchQuery}%`
      );
    }

    // 전체 개수 조회
    const { count, error: countError } = await query;

    if (countError) {
      console.error('로그 개수 조회 오류:', countError);
      return { data: [], total: 0 };
    }

    const total = count || 0;

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let dataQuery = supabase
      .from('activity_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    // 필터 재적용
    if (logTypeFilter !== 'all') {
      dataQuery = dataQuery.eq('log_type', logTypeFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate = new Date(0);
      }

      dataQuery = dataQuery.gte('created_at', startDate.toISOString());
    }

    if (searchQuery.trim()) {
      dataQuery = dataQuery.or(
        `user_name.ilike.%${searchQuery}%,action.ilike.%${searchQuery}%,details.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await dataQuery;

    if (error) {
      console.error('로그 조회 오류:', error);
      return { data: [], total: 0 };
    }

    const logs = ((data || []) as any[]).map((row: any) => mapRowToActivityLog(row as ActivityLogRow));

    return { data: logs, total };
  } catch (error) {
    console.error('로그 조회 중 예외 발생:', error);
    return { data: [], total: 0 };
  }
}

/**
 * 로그 타입별 통계 조회 (DB에서 직접 집계)
 */
async function fetchActivityLogStatsFromDB(): Promise<Record<LogType, number>> {
  try {
    const supabase = await createServerClient();
    const logTypes: LogType[] = [
      'USER_SIGNUP',
      'ADMIN_SIGNUP',
      'LOGIN_FAILED',
      'ADMIN_LOGIN',
      'SECTION_SETTING_CHANGE',
      'BOARD_CREATE',
      'BOARD_UPDATE',
      'BOARD_DELETE',
      'POST_CREATE',
      'POST_ANSWER',
      'ERROR',
    ];

    // 각 로그 타입별로 count 쿼리 실행 (병렬 처리)
    const countPromises = logTypes.map(async (logType) => {
      const { count, error } = await supabase
        .from('activity_logs' as any)
        .select('id', { count: 'exact', head: true })
        .eq('log_type', logType);

      if (error) {
        console.error(`로그 타입 ${logType} 카운트 오류:`, error);
        return { logType, count: 0 };
      }

      return { logType, count: count || 0 };
    });

    const results = await Promise.all(countPromises);

    // 결과를 Record로 변환
    const stats = results.reduce((acc, { logType, count }) => {
      acc[logType] = count;
      return acc;
    }, {} as Record<LogType, number>);

    return stats;
  } catch (error) {
    console.error('로그 통계 조회 중 예외 발생:', error);
    return getDefaultStats();
  }
}

/**
 * 로그 타입별 통계 조회 (관리자용)
 * 페이지 레벨에서 캐싱되므로 순수 DB 조회만 수행
 */
export async function getActivityLogStatsUsingAdmin(): Promise<Record<LogType, number>> {
  return fetchActivityLogStatsFromDB();
}

/**
 * 로그 타입별 통계 조회 (supabase 클라이언트 전달)
 * @deprecated getActivityLogStatsUsingAdmin 사용 권장
 */
export async function getActivityLogStats(
  supabase: SupabaseClient<Database>
): Promise<Record<LogType, number>> {
  // 내부적으로 getActivityLogStatsUsingAdmin 사용
  return getActivityLogStatsUsingAdmin();
}

/**
 * 기본 통계 값 반환
 */
function getDefaultStats(): Record<LogType, number> {
  return {
    USER_SIGNUP: 0,
    ADMIN_SIGNUP: 0,
    LOGIN_FAILED: 0,
    ADMIN_LOGIN: 0,
    SECTION_SETTING_CHANGE: 0,
    BOARD_CREATE: 0,
    BOARD_UPDATE: 0,
    BOARD_DELETE: 0,
    POST_CREATE: 0,
    POST_ANSWER: 0,
    ERROR: 0,
  };
}

/**
 * 통계 캐시 무효화 (로그 생성 시 호출)
 * 페이지 레벨 캐시를 무효화하기 위해 revalidatePath 사용
 * 이 함수는 더 이상 필요하지 않지만, 호환성을 위해 유지
 * @deprecated log-utils.ts에서 직접 revalidatePath를 호출하도록 변경됨
 */
export async function invalidateActivityLogStatsCache() {
  // 페이지 레벨 캐싱을 사용하므로 이 함수는 더 이상 필요하지 않음
  // log-utils.ts에서 revalidatePath를 직접 호출
}

/**
 * 전체 로그 개수 조회 (DB에서 직접 조회)
 */
async function fetchTotalActivityLogCountFromDB(): Promise<number> {
  try {
    const supabase = await createServerClient();
    const { count, error } = await supabase
      .from('activity_logs' as any)
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('전체 로그 개수 조회 오류:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('전체 로그 개수 조회 중 예외 발생:', error);
    return 0;
  }
}

/**
 * 전체 로그 개수 조회 (관리자용)
 * 페이지 레벨에서 캐싱되므로 순수 DB 조회만 수행
 */
export async function getTotalActivityLogCountUsingAdmin(): Promise<number> {
  return fetchTotalActivityLogCountFromDB();
}

/**
 * 전체 로그 개수 조회 (supabase 클라이언트 전달)
 * @deprecated getTotalActivityLogCountUsingAdmin 사용 권장
 */
export async function getTotalActivityLogCount(
  supabase: SupabaseClient<Database>
): Promise<number> {
  // 내부적으로 getTotalActivityLogCountUsingAdmin 사용
  return getTotalActivityLogCountUsingAdmin();
}

/**
 * 전체 로그 개수 캐시 무효화 (로그 생성 시 호출)
 * 페이지 레벨 캐시를 무효화하기 위해 revalidatePath 사용
 * 이 함수는 더 이상 필요하지 않지만, 호환성을 위해 유지
 * @deprecated log-utils.ts에서 직접 revalidatePath를 호출하도록 변경됨
 */
export async function invalidateTotalCountCache() {
  // 페이지 레벨 캐싱을 사용하므로 이 함수는 더 이상 필요하지 않음
  // log-utils.ts에서 revalidatePath를 직접 호출
}


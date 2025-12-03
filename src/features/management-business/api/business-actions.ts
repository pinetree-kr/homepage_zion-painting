'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import type { BusinessInfo, BusinessArea, BusinessCategory, Achievement } from '@/src/entities/business/model/types';
import { revalidatePath } from 'next/cache';
import { Database } from '@/src/shared/lib/supabase-types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * 사업소개 정보 로드
 * 공개 데이터이므로 익명 클라이언트 사용
 */
export async function getBusinessInfo(): Promise<BusinessInfo | null> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('business_info')
      .select('*')
      .limit(1)
      .maybeSingle() as {
        data: {
          id: string;
          introduction: string | null;
          areas: any;
          created_at: string | null;
          updated_at: string | null;
        } | null;
        error: any;
      };

    if (error) {
      console.error('사업소개 정보 로드 오류:', error);
      return {
        id: '',
        introduction: '',
        areas: [],
      };
    }

    return {
      id: data?.id || '',
      introduction: data?.introduction || '',
      areas: data && Array.isArray(data.areas) ? (data.areas as BusinessArea[]) : [],
      created_at: data?.created_at || null,
      updated_at: data?.updated_at || null,
    };
  } catch (error) {
    console.error('사업소개 정보 로드 중 예외 발생:', error);
    return {
      id: '',
      introduction: '',
      areas: [],
    };
  }
}

/**
 * 사업소개 정보 저장
 */
export async function saveBusinessInfo(businessInfo: Partial<BusinessInfo>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 정보 확인
    const { data: existingInfo } = await supabase
      .from('business_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    const updateData: any = {};

    if (businessInfo.introduction !== undefined) {
      updateData.introduction = businessInfo.introduction || '';
    }

    if (businessInfo.areas !== undefined) {
      updateData.areas = Array.isArray(businessInfo.areas)
        ? businessInfo.areas.map(area => ({
          title: area.title,
          description: area.description,
          icon: area.icon || '',
          features: Array.isArray(area.features) ? area.features : [],
          display_order: area.display_order || 0,
        }))
        : [];
    }

    if (existingInfo) {
      // 업데이트
      const { error } = await supabase
        .from('business_info')
        .update(updateData)
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('business_info')
        .insert(updateData);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 사업 카테고리 목록 로드
 */
export async function getBusinessCategories(): Promise<BusinessCategory[]> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('title', { ascending: true }) as {
        data: BusinessCategory[] | null;
        error: any;
      };

    if (error) {
      console.error('사업 카테고리 로드 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('사업 카테고리 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 사업 카테고리 저장
 */
export async function saveBusinessCategory(category: Partial<BusinessCategory>): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    if (category.id) {
      // 업데이트
      const updateData: any = { title: category.title };
      if (category.display_order !== undefined) {
        updateData.display_order = category.display_order;
      }

      const { error, data } = await supabase
        .from('business_categories')
        .update(updateData)
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      revalidatePath('/admin/sections/business/categories');

      return { success: true, id: data.id };
    } else {
      // 새로 생성 - display_order는 최대값 + 1로 설정
      const { data: maxOrderData } = await supabase
        .from('business_categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single() as { data: { display_order?: number } | null; error: any };

      const nextOrder = maxOrderData?.display_order !== undefined
        ? (maxOrderData.display_order + 1)
        : 0;

      const { error, data } = await supabase
        .from('business_categories')
        .insert({
          title: category.title || '',
          display_order: category.display_order !== undefined ? category.display_order : nextOrder
        } as any)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      revalidatePath('/admin/sections/business/categories');

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 사업 카테고리 순서 업데이트
 */
export async function updateBusinessCategoriesOrder(categories: { id: string; display_order: number }[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 배치 업데이트
    const updates = categories.map(cat =>
      supabase
        .from('business_categories')
        .update({ display_order: cat.display_order } as any)
        .eq('id', cat.id)
    );

    const results = await Promise.all(updates);

    const hasError = results.some(result => result.error);
    if (hasError) {
      const errorResult = results.find(result => result.error);
      return { success: false, error: errorResult?.error?.message || '순서 업데이트 중 오류가 발생했습니다.' };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/sections/business/categories');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 사업 카테고리 삭제
 */
export async function deleteBusinessCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('business_categories')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/sections/business/categories');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * HTML에서 텍스트만 추출하고 길이를 제한합니다.
 * @param html HTML 문자열
 * @param maxLength 최대 길이 (기본값: 50)
 * @param addEllipsis "..." 추가 여부 (기본값: false, DB 저장용)
 */
function stripHtmlAndTruncate(html: string, maxLength: number = 50, addEllipsis: boolean = false): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // HTML 태그 제거 (정규식 사용)
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // script 태그 제거
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // style 태그 제거
    .replace(/<[^>]+>/g, '') // 모든 HTML 태그 제거
    .replace(/&nbsp;/g, ' ') // &nbsp;를 공백으로
    .replace(/&amp;/g, '&') // &amp;를 &로
    .replace(/&lt;/g, '<') // &lt;를 <로
    .replace(/&gt;/g, '>') // &gt;를 >로
    .replace(/&quot;/g, '"') // &quot;를 "로
    .replace(/&#39;/g, "'") // &#39;를 '로
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim();

  // 길이 제한
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    if (addEllipsis) {
      text += '...';
    }
  }

  return text;
}

/**
 * 사업실적 목록 로드 (관리자용)
 */
export async function getBusinessAchievementsUsingAdmin(): Promise<Achievement[]> {
  const supabase = await createServerClient();
  return await getBusinessAchievements(supabase);
}

/**
 * 사업실적 목록 로드 (익명용)
 */
export async function getBusinessAchievementsUsingAnonymous(): Promise<Achievement[]> {
  const supabase = createAnonymousServerClient();
  return await getBusinessAchievements(supabase);
}

/**
 * 사업실적 목록 로드 (SupabaseClient 전달)
 */
export async function getBusinessAchievements(supabase: SupabaseClient<Database>): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('business_achievements')
      .select(`
        *,
        business_categories (
          id,
          title,
          created_at,
          updated_at
        )
      `)
      .is('deleted_at', null)
      .order('achievement_date', { ascending: false }) as {
        data: (Achievement & { business_categories: BusinessCategory | null })[] | null;
        error: any;
      };

    if (error) {
      console.error('사업실적 로드 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('사업실적 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 사업실적 목록 조회 (검색 및 페이지네이션 지원, 관리자용)
 */
export async function searchBusinessAchievementsUsingAdmin(
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Achievement[]; total: number; totalPages: number }> {
  const supabase = await createServerClient();
  return searchBusinessAchievements(supabase, searchTerm, page, itemsPerPage, sortColumn, sortDirection);
}

/**
 * 사업실적 목록 조회 (검색 및 페이지네이션 지원, SupabaseClient 전달)
 */
export async function searchBusinessAchievements(
  supabase: SupabaseClient<Database>,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Achievement[]; total: number; totalPages: number }> {
  try {
    let query = supabase
      .from('business_achievements')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 전체 개수 조회
    const { count, error: countError } = await query;

    if (countError) {
      console.error('사업실적 개수 조회 오류:', countError);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let dataQuery = supabase
      .from('business_achievements')
      .select(`
        *,
        business_categories (
          id,
          title,
          created_at,
          updated_at
        )
      `)
      .is('deleted_at', null)
      .range(from, to);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      dataQuery = dataQuery.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 정렬 적용
    if (sortColumn) {
      // 컬럼 ID를 DB 컬럼명으로 매핑
      const columnMapping: Record<string, string> = {
        'title': 'title',
        'status': 'status',
        'date': 'achievement_date',
        'category': 'category_id', // 카테고리는 category_id로 정렬
      };

      const dbColumn = columnMapping[sortColumn];
      if (dbColumn) {
        dataQuery = dataQuery
          .order(dbColumn, { ascending: sortDirection === 'asc' })
          .order('created_at', { ascending: false });
      } else {
        // 기본 정렬: achievement_date 내림차순
        dataQuery = dataQuery.order('achievement_date', { ascending: false })
          .order('created_at', { ascending: false });
      }
    } else {
      // 정렬이 없으면 기본 정렬: achievement_date 내림차순
      dataQuery = dataQuery.order('achievement_date', { ascending: false })
        .order('created_at', { ascending: false });
    }

    const { data, error } = await dataQuery as {
      data: (Achievement & { business_categories: BusinessCategory | null })[] | null;
      error: any;
    };

    if (error) {
      console.error('사업실적 로드 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    return {
      data: data || [],
      total,
      totalPages
    };
  } catch (error) {
    console.error('사업실적 검색 중 예외 발생:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * 사업실적 상세 로드 (관리자용)
 */
export async function getBusinessAchievementUsingAdmin(id: string): Promise<Achievement | null> {
  const supabase = await createServerClient();
  return await getBusinessAchievement(supabase, id);
}

/**
 * 사업실적 상세 로드 (익명용)
 */
export async function getBusinessAchievementUsingAnonymous(id: string): Promise<Achievement | null> {
  const supabase = createAnonymousServerClient();
  return await getBusinessAchievement(supabase, id);
}

/**
 * 사업실적 상세 로드 (SupabaseClient 전달)
 */
export async function getBusinessAchievement(supabase: SupabaseClient<Database>, id: string): Promise<Achievement | null> {
  try {
    const { data, error } = await supabase
      .from('business_achievements')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle() as { data: Achievement | null; error: any };

    if (error) {
      console.error('사업실적 로드 오류:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('사업실적 로드 중 예외 발생:', error);
    return null;
  }
}

/**
 * 사업실적 저장
 */
export async function saveBusinessAchievement(achievement: Omit<Achievement, 'id'> & { id?: string | null }): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    // content_summary 자동 생성 (HTML 태그 제거 후 최대 50자)
    const contentSummary = stripHtmlAndTruncate(achievement.content || '', 50);

    const updateData: any = {
      title: achievement.title || '',
      content: achievement.content || '',
      achievement_date: achievement.achievement_date || new Date().toISOString().split('T')[0],
      category_id: achievement.category_id || null,
      thumbnail_url: achievement.thumbnail_url || null,
      content_summary: contentSummary || null,
      status: achievement.status || 'draft',
    };
    console.error({ achievement })

    if (achievement.id) {
      console.log('업데이트')
      // 업데이트
      const { error, data } = await supabase
        .from('business_achievements')
        .update(updateData)
        .eq('id', achievement.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } else {
      console.log('새로 생성')
      // 새로 생성
      const { error, data } = await supabase
        .from('business_achievements')
        .insert(updateData)
        .select()
        .single();

      if (error) {
        console.error({ error })
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 사업실적 삭제 (soft delete)
 */
export async function deleteBusinessAchievement(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('business_achievements')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/sections/business/achievements');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


/**
 * 사업 분야 목록 로드
 */
export async function getBusinessAreas(): Promise<BusinessArea[]> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('business_info')
      .select('areas')
      .maybeSingle() as {
        data: { areas: BusinessArea[] | null } | null;
        error: any;
      };

    if (error) {
      console.error('사업 분야 로드 오류:', error);
      return [];
    }

    return data?.areas || [];
  } catch (error) {
    console.error('사업 분야 로드 중 예외 발생:', error);
    return [];
  }
}
'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import type { BusinessInfo, BusinessArea, BusinessCategory, Achievement } from '@/src/entities/business/model/types';

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
      const { error, data } = await supabase
        .from('business_categories')
        .update({ title: category.title })
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } else {
      // 새로 생성
      const { error, data } = await supabase
        .from('business_categories')
        .insert({ title: category.title || '' })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    }
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

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 사업실적 목록 로드 (카테고리 정보 포함)
 */
export async function getBusinessAchievements(): Promise<(Achievement & { category?: BusinessCategory | null })[]> {
  try {
    const supabase = createAnonymousServerClient();
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
      .order('achievement_date', { ascending: false }) as {
        data: (Achievement & { business_categories: BusinessCategory | null })[] | null;
        error: any;
      };

    if (error) {
      console.error('사업실적 로드 오류:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      achievement_date: item.achievement_date,
      category_id: item.category_id,
      image_url: item.image_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
      category: item.business_categories || null,
    }));
  } catch (error) {
    console.error('사업실적 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 사업실적 저장
 */
export async function saveBusinessAchievement(achievement: Partial<Achievement>): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    const updateData: any = {
      title: achievement.title || '',
      content: achievement.content || '',
      achievement_date: achievement.achievement_date || new Date().toISOString().split('T')[0],
      category_id: achievement.category_id || null,
      image_url: achievement.image_url || null,
    };

    if (achievement.id) {
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
      // 새로 생성
      const { error, data } = await supabase
        .from('business_achievements')
        .insert(updateData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 사업실적 삭제
 */
export async function deleteBusinessAchievement(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('business_achievements')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


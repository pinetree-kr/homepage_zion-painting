'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
// import type { CompanyInfo, CompanyHistory } from '@/src/shared/lib/supabase-types';
import type { CompanyInfo, CompanyHistory, CompanyHistoryType } from '@/src/entities/company/model/types';

/**
 * 회사 정보 로드
 */
export async function getCompanyInfo(): Promise<{ aboutContent: string; organizationContent: string } | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .limit(1)
      .maybeSingle() as { data: CompanyInfo | null; error: any };

    if (error) {
      console.error('회사 정보 로드 오류:', error);
      return null;
    }

    return {
      aboutContent: data?.about_content || '',
      organizationContent: data?.organization_content || '',
    };
  } catch (error) {
    console.error('회사 정보 로드 중 예외 발생:', error);
    return null;
  }
}

/**
 * 회사소개 내용 저장
 */
export async function saveAboutContent(content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 정보 확인
    const { data: existingInfo } = await supabase
      .from('company_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    if (existingInfo) {
      console.log({ content })
      // 업데이트
      const { error } = await supabase
        .from('company_info')
        .update({ about_content: content })
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('company_info')
        .insert({ about_content: content });

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
 * 조직도 내용 저장
 */
export async function saveOrganizationContent(content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 정보 확인
    const { data: existingInfo } = await supabase
      .from('company_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    if (existingInfo) {
      // 업데이트
      const { error } = await supabase
        .from('company_info')
        .update({ organization_content: content })
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('company_info')
        .insert({ organization_content: content });

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
 * 연혁 목록 로드
 */
export async function getCompanyHistories(): Promise<CompanyHistory[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('company_info')
      .select('histories')
      .limit(1)
      .maybeSingle() as { data: { histories: CompanyHistory[] | null } | null; error: any };

    if (error) {
      console.error('연혁 로드 오류:', error);
      return [];
    }

    // histories가 null이거나 배열이 아니면 빈 배열 반환
    if (!data?.histories || !Array.isArray(data.histories)) {
      return [];
    }

    // display_order 기준으로 정렬하여 반환
    return data.histories
      .map((item: any) => ({
        id: item.id || `temp-${Date.now()}-${Math.random()}`,
        year: item.year || '',
        month: item.month || null,
        content: item.content || '',
        type: item.type || 'biz',
        display_order: item.display_order || 0,
        created_at: item.created_at || null,
        updated_at: item.updated_at || null,
      }))
      .sort((a, b) => a.display_order - b.display_order);
  } catch (error) {
    console.error('연혁 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 연혁 저장
 */
export async function saveCompanyHistory(history: CompanyHistory[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 company_info 확인
    const { data: existingInfo } = await supabase
      .from('company_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    // histories JSON 배열로 변환 (display_order 기준 정렬)
    const historiesJson = history
      .map((item, index) => ({
        id: item.id || `temp-${Date.now()}-${index}`,
        year: item.year,
        month: item.month || null,
        content: item.content,
        type: item.type || 'biz',
        display_order: item.display_order || index + 1,
        created_at: item.created_at || null,
        updated_at: item.updated_at || new Date().toISOString(),
      }))
      .sort((a, b) => a.display_order - b.display_order);

    if (existingInfo) {
      // 기존 레코드 업데이트
      const { error } = await supabase
        .from('company_info')
        .update({ histories: historiesJson })
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새 레코드 생성
      const { error } = await supabase
        .from('company_info')
        .insert({ histories: historiesJson });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


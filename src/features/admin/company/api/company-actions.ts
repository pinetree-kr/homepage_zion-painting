'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
// import type { CompanyInfo, CompanyHistory } from '@/src/shared/lib/supabase-types';
import type { CompanyInfo, CompanyHistory } from '@/src/entities/company/model/types';

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
export async function getCompanyHistory(): Promise<CompanyHistory[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('company_history')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('연혁 로드 오류:', error);
      return [];
    }

    return (data || []).map((item: CompanyHistory) => ({
      id: item.id,
      year: item.year,
      month: item.month || null,
      content: item.content,
      display_order: item.display_order,
      created_at: item.created_at || null,
      updated_at: item.updated_at || null,
    }));
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

    // 기존 연혁 ID 목록 가져오기
    const { data: existingHistory } = await supabase
      .from('company_history')
      .select('id');

    // 기존 연혁 삭제
    if (existingHistory && existingHistory.length > 0) {
      const existingIds = existingHistory.map((h: any) => h.id);
      const { error: deleteError } = await supabase
        .from('company_history')
        .delete()
        .in('id', existingIds);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }
    }

    // 새 연혁 추가
    if (history.length > 0) {
      const historyToInsert = history.map((item, index) => ({
        year: item.year,
        month: item.month || null,
        content: item.content,
        display_order: item.display_order || index + 1,
        created_at: item.created_at || null,
        updated_at: item.updated_at || null,
      } as CompanyHistory));

      const { error: insertError } = await supabase
        .from('company_history')
        .insert(historyToInsert);

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


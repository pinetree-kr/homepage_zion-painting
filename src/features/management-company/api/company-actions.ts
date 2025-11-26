'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
// import type { CompanyInfo, CompanyHistory } from '@/src/shared/lib/supabase-types';
import type { CompanyInfo, CompanyHistory, CompanyHistoryType, OrganizationMember, CompanyAbout, CompanyStrength, CompanyValue } from '@/src/entities/company/model/types';
import type { ContactInfo } from '@/src/entities/contact/model/types';

// /**
//  * 회사 소개 로드 (기존 텍스트 방식 - 하위 호환성)
//  */
// export async function getCompanyIntroductionInfo(): Promise<string> {
//   try {
//     const supabase = await createServerClient();
//     const { data, error } = await supabase
//       .from('company_info')
//       .select('introduction')
//       .limit(1)
//       .maybeSingle() as { data: CompanyInfo | null; error: any };

//     if (error) {
//       console.error('회사 정보 로드 오류:', error);
//       return '';
//     }

//     return data?.introduction || '';
//   } catch (error) {
//     console.error('회사 정보 로드 중 예외 발생:', error);
//     return '';
//   }
// }

/**
 * 회사소개 정보 로드 (개별 필드)
 * 공개 데이터이므로 익명 클라이언트 사용
 */
export async function getCompanyAboutInfo(): Promise<CompanyAbout | null> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('company_info')
      .select('introduction, vision, greetings, mission, strengths, values')
      .limit(1)
      .maybeSingle() as {
        data: {
          introduction: string | null;
          vision: string | null;
          greetings: string | null;
          mission: string | null;
          strengths: CompanyStrength[] | null;
          values: CompanyValue[] | null;
        } | null; error: any
      };

    if (error) {
      console.error('회사소개 정보 로드 오류:', error);
      return {
        introduction: '',
        strengths: [],
        vision: '',
        values: [],
        greetings: '',
        mission: '',
      };
    }

    return {
      introduction: data?.introduction || '',
      strengths: Array.isArray(data?.strengths) ? data.strengths : [],
      vision: data?.vision || '',
      values: Array.isArray(data?.values) ? data.values : [],
      greetings: data?.greetings || '',
      mission: data?.mission || '',
    };
  } catch (error) {
    console.error('회사소개 정보 로드 중 예외 발생:', error);
    return {
      introduction: '',
      strengths: [],
      vision: '',
      values: [],
      greetings: '',
      mission: '',
    };
  }
}

/**
 * 회사소개 정보 저장 (개별 필드)
 */
export async function saveCompanyAboutInfo(aboutInfo: CompanyAbout): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 정보 확인
    const { data: existingInfo } = await supabase
      .from('company_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    // 개별 필드로 저장
    const updateData = {
      introduction: aboutInfo.introduction || '',
      vision: aboutInfo.vision || '',
      greetings: aboutInfo.greetings || '',
      mission: aboutInfo.mission || '',
      strengths: Array.isArray(aboutInfo.strengths) ? aboutInfo.strengths.map(strength => ({
        icon: strength.icon,
        title: strength.title,
        description: strength.description,
      })) : [],
      values: Array.isArray(aboutInfo.values) ? aboutInfo.values.map(value => ({
        title: value.title,
        description: value.description,
      })) : [],
    };

    if (existingInfo) {
      // 업데이트
      const { error } = await supabase
        .from('company_info')
        .update(updateData)
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('company_info')
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
 * 회사소개 개별 필드 저장
 */
export async function saveCompanyAboutField(
  field: 'introduction' | 'vision' | 'greetings' | 'mission' | 'strengths' | 'values',
  value: string | CompanyStrength[] | CompanyValue[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 정보 확인
    const { data: existingInfo } = await supabase
      .from('company_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    const updateData: Record<string, any> = {};

    if (field === 'strengths' || field === 'values') {
      updateData[field] = Array.isArray(value) ? value : [];
    } else {
      updateData[field] = value || '';
    }

    if (existingInfo) {
      // 업데이트
      const { error } = await supabase
        .from('company_info')
        .update(updateData)
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('company_info')
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
 * 연혁 목록 로드
 * 공개 데이터이므로 익명 클라이언트 사용
 */
export async function getCompanyHistories(): Promise<CompanyHistory[]> {
  try {
    const supabase = createAnonymousServerClient();
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
      .map((item: CompanyHistory) => ({
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

/**
 * 조직도 구성원 목록 로드
 * 공개 데이터이므로 익명 클라이언트 사용
 */
export async function getCompanyOrganizationMembers(): Promise<OrganizationMember[]> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('company_info')
      .select('organization_members')
      .limit(1)
      .maybeSingle() as { data: { organization_members: OrganizationMember[] | null } | null; error: any };

    if (error) {
      console.error('조직도 구성원 로드 오류:', error);
      return [];
    }

    // organization_members가 null이거나 배열이 아니면 빈 배열 반환
    if (!data?.organization_members || !Array.isArray(data.organization_members)) {
      return [];
    }

    // display_order 기준으로 정렬하여 반환
    return data.organization_members
      .map((item: any) => ({
        id: item.id || `temp-${Date.now()}-${Math.random()}`,
        name: item.name || '',
        title: item.title || '',
        image_url: item.image_url || null,
        display_order: item.display_order || 0,
        created_at: item.created_at || null,
        updated_at: item.updated_at || null,
      }))
      .sort((a, b) => a.display_order - b.display_order);

  } catch (error) {
    console.error('조직도 구성원 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 조직도 구성원 저장
 */
export async function saveCompanyOrganizationMembers(members: OrganizationMember[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 company_info 확인
    const { data: existingInfo } = await supabase
      .from('company_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    // organization_members JSON 배열로 변환 (display_order 기준 정렬)
    const membersJson = members
      .map((item, index) => ({
        id: item.id || `temp-${Date.now()}-${index}`,
        name: item.name,
        title: item.title,
        image_url: item.image_url || null,
        display_order: item.display_order || index + 1,
        created_at: item.created_at || null,
        updated_at: item.updated_at || new Date().toISOString(),
      }))
      .sort((a, b) => a.display_order - b.display_order);

    if (existingInfo) {
      // 기존 레코드 업데이트
      const { error } = await supabase
        .from('company_info')
        .update({ organization_members: membersJson })
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새 레코드 생성
      const { error } = await supabase
        .from('company_info')
        .insert({ organization_members: membersJson });

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
 * 회사정보(연락처) 로드
 * 공개 데이터이므로 익명 클라이언트 사용
 */
export async function getContactInfo(): Promise<ContactInfo | null> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('회사정보 로드 오류:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email || '',
      address: data.address || '',
      business_hours: data.business_hours || null,
      phone_primary: data.phone_primary || null,
      phone_secondary: data.phone_secondary || null,
      fax: data.fax || null,
      map_url: data.map_url || null,
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
    };
  } catch (error) {
    console.error('회사정보 로드 중 예외 발생:', error);
    return null;
  }
}

/**
 * 회사정보(연락처) 저장
 */
export async function saveContactInfo(contactInfo: Partial<Omit<ContactInfo, 'id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 정보 확인
    const { data: existingInfo } = await supabase
      .from('contact_info')
      .select('id')
      .limit(1)
      .maybeSingle();

    const updateData = {
      email: contactInfo.email || '',
      address: contactInfo.address || '',
      business_hours: contactInfo.business_hours || null,
      phone_primary: contactInfo.phone_primary || null,
      phone_secondary: contactInfo.phone_secondary || null,
      fax: contactInfo.fax || null,
      map_url: contactInfo.map_url || null,
    };

    if (existingInfo) {
      // 업데이트
      const { error } = await supabase
        .from('contact_info')
        .update(updateData)
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('contact_info')
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


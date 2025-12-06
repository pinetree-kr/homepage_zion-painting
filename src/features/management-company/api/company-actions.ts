'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
// import type { CompanyInfo, CompanyHistory } from '@/src/shared/lib/supabase-types';
import type { CompanyInfo, CompanyHistory, CompanyHistoryType, OrganizationMember, CompanyAbout, CompanyStrength, CompanyValue } from '@/src/entities/company/model/types';
import type { ContactInfo } from '@/src/entities/contact/model/types';
import type { SiteSetting } from '@/src/entities/site-setting/model/types';
import { formatPhoneForDisplay } from '@/src/shared/lib/utils';
import { logSectionSettingChange } from '@/src/entities/system';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';

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
      .from('pages')
      .select('metadata')
      .eq('code', 'company_intro')
      .eq('status', 'published')
      .maybeSingle() as {
        data: {
          metadata: {
            introduction?: string | null;
            vision?: string | null;
            greetings?: string | null;
            mission?: string | null;
            strengths?: CompanyStrength[] | null;
            values?: CompanyValue[] | null;
          };
        } | null;
        error: any;
      };

    if (error && error.code !== 'PGRST116') {
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

    if (!data?.metadata) {
      return {
        introduction: '',
        strengths: [],
        vision: '',
        values: [],
        greetings: '',
        mission: '',
      };
    }

    const metadata = data.metadata;
    return {
      introduction: metadata.introduction || '',
      strengths: Array.isArray(metadata.strengths) ? metadata.strengths : [],
      vision: metadata.vision || '',
      values: Array.isArray(metadata.values) ? metadata.values : [],
      greetings: metadata.greetings || '',
      mission: metadata.mission || '',
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

    // 기존 페이지 확인
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, metadata')
      .eq('code', 'company_intro')
      .maybeSingle() as { data: { id: string; metadata: any } | null; error: any };

    // metadata로 저장
    const newMetadata = {
      ...(existingPage?.metadata || {}),
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

    if (existingPage?.id) {
      // 업데이트
      const { error } = await supabase
        .from('pages')
        .update({ metadata: newMetadata })
        .eq('id', existingPage.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('pages')
        .insert({
          code: 'company_intro',
          page: 'about',
          section_type: 'rich_text',
          display_order: 0,
          status: 'published',
          metadata: newMetadata,
        });

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

    // 기존 페이지 확인
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, metadata')
      .eq('code', 'company_intro')
      .maybeSingle() as { data: { id: string; metadata: any } | null; error: any };

    const newMetadata = {
      ...(existingPage?.metadata || {}),
    };

    if (field === 'strengths' || field === 'values') {
      newMetadata[field] = Array.isArray(value) ? value : [];
    } else {
      newMetadata[field] = value || '';
    }

    if (existingPage?.id) {
      // 업데이트
      const { error } = await supabase
        .from('pages')
        .update({ metadata: newMetadata })
        .eq('id', existingPage.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('pages')
        .insert({
          code: 'company_intro',
          page: 'about',
          section_type: 'rich_text',
          display_order: 0,
          status: 'published',
          metadata: newMetadata,
        });

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
      .from('pages')
      .select('metadata')
      .eq('code', 'company_intro')
      .eq('status', 'published')
      .maybeSingle() as {
        data: {
          metadata: {
            histories?: CompanyHistory[] | null;
          };
        } | null;
        error: any;
      };

    if (error && error.code !== 'PGRST116') {
      console.error('연혁 로드 오류:', error);
      return [];
    }

    // histories가 null이거나 배열이 아니면 빈 배열 반환
    const histories = data?.metadata?.histories;
    if (!histories || !Array.isArray(histories)) {
      return [];
    }

    // display_order 기준으로 정렬하여 반환
    return histories
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

    // 기존 페이지 확인
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, metadata')
      .eq('code', 'company_intro')
      .maybeSingle() as { data: { id: string; metadata: any } | null; error: any };

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

    const newMetadata = {
      ...(existingPage?.metadata || {}),
      histories: historiesJson,
    };

    if (existingPage?.id) {
      // 기존 레코드 업데이트
      const { error } = await supabase
        .from('pages')
        .update({ metadata: newMetadata })
        .eq('id', existingPage.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새 레코드 생성
      const { error } = await supabase
        .from('pages')
        .insert({
          code: 'company_intro',
          page: 'about',
          section_type: 'rich_text',
          display_order: 0,
          status: 'published',
          metadata: newMetadata,
        });

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
      .from('pages')
      .select('metadata')
      .eq('code', 'company_intro')
      .eq('status', 'published')
      .maybeSingle() as {
        data: {
          metadata: {
            organization_members?: OrganizationMember[] | null;
          };
        } | null;
        error: any;
      };

    if (error && error.code !== 'PGRST116') {
      console.error('조직도 구성원 로드 오류:', error);
      return [];
    }

    // organization_members가 null이거나 배열이 아니면 빈 배열 반환
    const organizationMembers = data?.metadata?.organization_members;
    if (!organizationMembers || !Array.isArray(organizationMembers)) {
      return [];
    }

    // display_order 기준으로 정렬하여 반환
    return organizationMembers
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

    // 기존 페이지 확인
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, metadata')
      .eq('code', 'company_intro')
      .maybeSingle() as { data: { id: string; metadata: any } | null; error: any };

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

    const newMetadata = {
      ...(existingPage?.metadata || {}),
      organization_members: membersJson,
    };

    if (existingPage?.id) {
      // 기존 레코드 업데이트
      const { error } = await supabase
        .from('pages')
        .update({ metadata: newMetadata })
        .eq('id', existingPage.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새 레코드 생성
      const { error } = await supabase
        .from('pages')
        .insert({
          code: 'company_intro',
          page: 'about',
          section_type: 'rich_text',
          display_order: 0,
          status: 'published',
          metadata: newMetadata,
        });

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
      .from('site_settings')
      .select('id, contact, created_at, updated_at')
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('회사정보 로드 오류:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const contact = (data.contact as any) || {};
    
    return {
      id: data.id,
      email: contact.email || '',
      address: contact.address || '',
      business_hours: contact.business_hours || null,
      phone_primary: formatPhoneForDisplay(contact.phone_primary),
      phone_secondary: formatPhoneForDisplay(contact.phone_secondary),
      fax: formatPhoneForDisplay(contact.fax),
      map_url: contact.map_url || null,
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
      .from('site_settings')
      .select('id, contact')
      .is('deleted_at', null)
      .maybeSingle();

    const existingContact = (existingInfo?.contact as SiteSetting['contact']) || {
      email: null,
      address: null,
      business_hours: null,
      phone_primary: null,
      phone_secondary: null,
      fax: null,
      map_url: null,
      extra_json: null,
    };
    
    const updateData: Partial<SiteSetting> = {
      contact: {
        ...existingContact,
        email: contactInfo.email !== undefined ? (contactInfo.email || null) : existingContact.email,
        address: contactInfo.address !== undefined ? (contactInfo.address || null) : existingContact.address,
        business_hours: contactInfo.business_hours !== undefined ? contactInfo.business_hours : existingContact.business_hours,
        phone_primary: contactInfo.phone_primary !== undefined ? contactInfo.phone_primary : existingContact.phone_primary,
        phone_secondary: contactInfo.phone_secondary !== undefined ? contactInfo.phone_secondary : existingContact.phone_secondary,
        fax: contactInfo.fax !== undefined ? contactInfo.fax : existingContact.fax,
        map_url: contactInfo.map_url !== undefined ? contactInfo.map_url : existingContact.map_url,
        extra_json: existingContact.extra_json, // extra_json은 변경하지 않음
      },
    };

    if (existingInfo) {
      // 업데이트
      const { error } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('site_settings')
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


'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
// import type { CompanyInfo, CompanyHistory } from '@/src/shared/lib/supabase-types';
import type { CompanyInfo, CompanyHistory, CompanyHistoryType, OrganizationMember, CompanyAbout, CompanyStrength, CompanyValue } from '@/src/entities/company/model/types';
import type { ContactInfo } from '@/src/entities/contact/model/types';
import type { SiteSetting, MapConfig } from '@/src/entities/site-setting/model/types';
import { formatPhoneForDisplay, getCurrentISOString } from '@/src/shared/lib/utils';
import { logSectionSettingChange } from '@/src/entities/system';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { encryptMapApiKey, decryptMapApiKey } from '@/src/shared/lib/crypto';

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
      .eq('code', 'company_page')
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
      .eq('code', 'company_page')
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
          code: 'company_page',
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
      .eq('code', 'company_page')
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
          code: 'company_page',
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
      .eq('code', 'company_page')
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
      .eq('code', 'company_page')
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
        updated_at: item.updated_at || getCurrentISOString(),
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
          code: 'company_page',
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
      .eq('code', 'company_page')
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
      .eq('code', 'company_page')
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
        updated_at: item.updated_at || getCurrentISOString(),
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
          code: 'company_page',
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
 * 환경변수에서 지도 API 키 존재 여부 확인
 */
export async function checkMapApiKeys(): Promise<{
  kakao: boolean;
  naver: boolean;
}> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return {
      kakao: !!(env.KAKAO_CLIENT_ID && env.KAKAO_CLIENT_ID.trim() !== ''),
      naver: !!(
        env.NCLOUD_CLIENT_ID &&
        env.NCLOUD_CLIENT_ID.trim() !== '' &&
        env.NCLOUD_CLIENT_SECRET &&
        env.NCLOUD_CLIENT_SECRET.trim() !== ''
      ),
    };
  } catch (error) {
    console.error('환경변수 확인 오류:', error);
    return { kakao: false, naver: false };
  }
}

/**
 * 저장된 지도 API 키 가져오기 (클라이언트에서 사용)
 * DB에 저장된 암호화된 키를 복호화하여 반환
 */
export async function getMapApiKeys(): Promise<{
  kakao: string | null;
  naver: { clientId: string | null; clientSecret: string | null };
}> {
  try {
    const contactInfo = await getContactInfo();
    if (!contactInfo?.maps || !Array.isArray(contactInfo.maps)) {
      return { kakao: null, naver: { clientId: null, clientSecret: null } };
    }

    const decryptedKeys = await decryptMapApiKeys(contactInfo.maps);
    
    return {
      kakao: decryptedKeys.kakao.client_id,
      naver: {
        clientId: decryptedKeys.naver.client_id,
        clientSecret: decryptedKeys.naver.client_secret,
      },
    };
  } catch (error) {
    console.error('지도 API 키 가져오기 오류:', error);
    return { kakao: null, naver: { clientId: null, clientSecret: null } };
  }
}

/**
 * 지도 API 키 복호화 (관리자용)
 */
export async function decryptMapApiKeys(maps: MapConfig[] | null): Promise<{
  kakao: { client_id: string | null };
  naver: { client_id: string | null; client_secret: string | null };
}> {
  if (!maps || !Array.isArray(maps)) {
    return {
      kakao: { client_id: null },
      naver: { client_id: null, client_secret: null },
    };
  }

  const kakaoMap = maps.find((m) => m.provider === 'kakao');
  const naverMap = maps.find((m) => m.provider === 'naver');

  const result = {
    kakao: { client_id: null as string | null },
    naver: { client_id: null as string | null, client_secret: null as string | null },
  };

  if (kakaoMap?.client_id) {
    try {
      result.kakao.client_id = await decryptMapApiKey(kakaoMap.client_id);
    } catch (error) {
      console.error('카카오맵 API 키 복호화 오류:', error);
    }
  }

  if (naverMap?.client_id) {
    try {
      result.naver.client_id = await decryptMapApiKey(naverMap.client_id);
    } catch (error) {
      console.error('네이버맵 Client ID 복호화 오류:', error);
    }
  }

  if (naverMap?.client_secret) {
    try {
      result.naver.client_secret = await decryptMapApiKey(naverMap.client_secret);
    } catch (error) {
      console.error('네이버맵 Client Secret 복호화 오류:', error);
    }
  }

  return result;
}

/**
 * 주소를 좌표로 변환 (Geocoding)
 * 저장된 client_id와 client_secret 사용
 */
export async function geocodeAddress(
  address: string,
  provider: 'kakao' | 'naver',
  clientId?: string | null,
  clientSecret?: string | null
): Promise<{ success: boolean; coords?: [number, number]; error?: string }> {
  try {
    if (!address || address.trim() === '') {
      return { success: false, error: '주소를 입력해주세요.' };
    }

    if (provider === 'kakao') {
      if (!clientId || clientId.trim() === '') {
        return { success: false, error: '카카오맵 Client ID가 설정되지 않았습니다.' };
      }

      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: {
            Authorization: `KakaoAK ${clientId}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as any;
        return {
          success: false,
          error: errorData.message || '카카오맵 API 호출에 실패했습니다.',
        };
      }

      const data = await response.json() as any;
      if (data.documents && data.documents.length > 0) {
        const firstResult = data.documents[0];
        const lat = parseFloat(firstResult.y);
        const lng = parseFloat(firstResult.x);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { success: true, coords: [lat, lng] };
        }
      }

      return { success: false, error: '주소를 찾을 수 없습니다.' };
    } else if (provider === 'naver') {
      if (!clientId || clientId.trim() === '' || !clientSecret || clientSecret.trim() === '') {
        return { success: false, error: '네이버맵 Client ID와 Secret이 설정되지 않았습니다.' };
      }

      const response = await fetch(
        `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`,
        {
          headers: {
            'X-NCP-APIGW-API-KEY-ID': clientId,
            'X-NCP-APIGW-API-KEY': clientSecret,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as any;
        return {
          success: false,
          error: errorData.error?.message || '네이버맵 API 호출에 실패했습니다.',
        };
      }

      const data = await response.json() as any;
      if (data.addresses && data.addresses.length > 0) {
        const firstResult = data.addresses[0];
        const lat = parseFloat(firstResult.y);
        const lng = parseFloat(firstResult.x);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { success: true, coords: [lat, lng] };
        }
      }

      return { success: false, error: '주소를 찾을 수 없습니다.' };
    }

    return { success: false, error: '지원하지 않는 지도 제공자입니다.' };
  } catch (error: any) {
    console.error('Geocoding 오류:', error);
    return { success: false, error: error.message || '주소 변환 중 오류가 발생했습니다.' };
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
      map_url: contact.map_url || null, // deprecated
      maps: contact.maps || null, // 새로운 maps 배열
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
      maps: null,
      extra_json: null,
    };

    // maps 배열 처리: client_id와 client_secret 암호화
    let processedMaps = existingContact.maps;
    if (contactInfo.maps !== undefined && contactInfo.maps !== null) {
      processedMaps = await Promise.all(
        contactInfo.maps.map(async (map) => {
          const encryptedMap: MapConfig = {
            provider: map.provider,
            enabled: map.enabled,
            coords: map.coords,
            client_id: null,
            client_secret: null,
          };

          // client_id 암호화
          if (map.client_id && map.client_id.trim() !== '') {
            // 이미 암호화된 형식인지 확인 (iv:authTag:encrypted 형식)
            if (map.client_id.includes(':') && map.client_id.split(':').length === 3) {
              // 이미 암호화된 값이면 그대로 사용
              encryptedMap.client_id = map.client_id;
            } else {
              // 평문이면 암호화
              encryptedMap.client_id = await encryptMapApiKey(map.client_id);
            }
          }

          // client_secret 암호화 (네이버맵만)
          if (map.provider === 'naver' && map.client_secret && map.client_secret.trim() !== '') {
            // 이미 암호화된 형식인지 확인
            if (map.client_secret.includes(':') && map.client_secret.split(':').length === 3) {
              encryptedMap.client_secret = map.client_secret;
            } else {
              encryptedMap.client_secret = await encryptMapApiKey(map.client_secret);
            }
          }

          return encryptedMap;
        })
      );
    }

    const updateData: any = {
      contact: {
        ...existingContact,
        email: contactInfo.email !== undefined ? (contactInfo.email || null) : existingContact.email,
        address: contactInfo.address !== undefined ? (contactInfo.address || null) : existingContact.address,
        business_hours: contactInfo.business_hours !== undefined ? contactInfo.business_hours : existingContact.business_hours,
        phone_primary: contactInfo.phone_primary !== undefined ? contactInfo.phone_primary : existingContact.phone_primary,
        phone_secondary: contactInfo.phone_secondary !== undefined ? contactInfo.phone_secondary : existingContact.phone_secondary,
        fax: contactInfo.fax !== undefined ? contactInfo.fax : existingContact.fax,
        maps: processedMaps,
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


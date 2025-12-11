'use client';

import { createBrowserClient } from '@/src/shared/lib/supabase/client';

/**
 * 약관 동의 저장 (클라이언트 사이드)
 * terms_agreements 테이블에 저장하고 user_metadata도 업데이트
 */
export async function saveTermsAgreement(
  userId: string,
  agreementType: 'terms' | 'privacy',
  version: string,
  userAgent?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();

    // 1. terms_agreements 테이블에 저장
    const { error: insertError } = await supabase
      .from('terms_agreements')
      .insert({
        user_id: userId,
        agreement_type: agreementType,
        version: version,
        agreed: true,
        ip_address: null, // 클라이언트에서는 IP 주소를 가져올 수 없음
        user_agent: userAgent || null,
      });

    if (insertError) {
      console.error('약관 동의 저장 오류:', insertError);
      return {
        success: false,
        error: insertError.message,
      };
    }

    // 2. 현재 user_metadata 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: '사용자 정보를 가져올 수 없습니다.',
      };
    }

    const currentMetadata = user.user_metadata || {};
    
    // 3. user_metadata 업데이트 (약관 동의 정보 추가)
    // 이미 저장된 약관 정보도 유지
    const updatedMetadata = {
      ...currentMetadata,
      terms_agreed_version: version,
      ...(agreementType === 'terms' && { terms_agreed: true }),
      ...(agreementType === 'privacy' && { privacy_agreed: true }),
    };

    const { error: updateError } = await supabase.auth.updateUser({
      data: updatedMetadata,
    });

    if (updateError) {
      console.error('user_metadata 업데이트 오류:', updateError);
      // terms_agreements 테이블에는 저장되었으므로 부분 성공으로 처리
      // 하지만 사용자에게는 오류로 표시하지 않음
    }

    return { success: true };
  } catch (error) {
    console.error('약관 동의 저장 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 두 약관을 모두 저장하고 user_metadata를 한 번만 업데이트
 * 더 효율적인 방법
 */
export async function saveAllTermsAgreements(
  userId: string,
  version: string,
  userAgent?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();

    // 1. 두 약관을 모두 terms_agreements 테이블에 저장
    const { error: insertError } = await supabase
      .from('terms_agreements')
      .insert([
        {
          user_id: userId,
          agreement_type: 'terms',
          version: version,
          agreed: true,
          ip_address: null,
          user_agent: userAgent || null,
        },
        {
          user_id: userId,
          agreement_type: 'privacy',
          version: version,
          agreed: true,
          ip_address: null,
          user_agent: userAgent || null,
        },
      ]);

    if (insertError) {
      console.error('약관 동의 저장 오류:', insertError);
      return {
        success: false,
        error: insertError.message,
      };
    }

    // 2. user_metadata 업데이트 (한 번만)
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        terms_agreed_version: version,
        terms_agreed: true,
        privacy_agreed: true,
      },
    });

    if (updateError) {
      console.error('user_metadata 업데이트 오류:', updateError);
      // terms_agreements 테이블에는 저장되었으므로 부분 성공으로 처리
    }

    return { success: true };
  } catch (error) {
    console.error('약관 동의 저장 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}


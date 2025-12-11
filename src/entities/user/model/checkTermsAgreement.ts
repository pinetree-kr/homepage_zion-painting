"use server"

import { createServerClient } from "@/src/shared/lib/supabase/server";

/**
 * 서버 사이드에서 사용자의 약관 동의 여부 확인
 * @param userId 사용자 ID
 * @param version 약관 버전 (YYYYMMDD 형식)
 * @returns 약관 동의 여부 (terms, privacy)
 */
export async function checkTermsAgreementServer(
  userId: string,
  version: string
): Promise<{ termsAgreed: boolean; privacyAgreed: boolean }> {
  try {
    const supabase = await createServerClient();

    // 해당 버전의 약관 동의 여부 확인
    const { data, error } = await supabase
      .from('terms_agreements')
      .select('agreement_type, agreed')
      .eq('user_id', userId)
      .eq('version', version)
      .eq('agreed', true);

    if (error) {
      console.error('약관 동의 확인 오류:', error);
      return { termsAgreed: false, privacyAgreed: false };
    }

    const termsAgreed = data?.some(item => item.agreement_type === 'terms') || false;
    const privacyAgreed = data?.some(item => item.agreement_type === 'privacy') || false;

    return { termsAgreed, privacyAgreed };
  } catch (error) {
    console.error('약관 동의 확인 중 오류 발생:', error);
    return { termsAgreed: false, privacyAgreed: false };
  }
}


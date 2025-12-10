"use server"

import { headers } from 'next/headers';
import { logAdminLogin, logLoginFailed } from '@/src/entities/system';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';
import { createSecretClient } from '@/src/shared/lib/supabase/service';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';

/**
 * 클라이언트 IP 주소 가져오기
 */
async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const cfConnectingIp = headersList.get('cf-connecting-ip'); // Cloudflare

    if (forwardedFor) {
      // x-forwarded-for는 여러 IP가 쉼표로 구분될 수 있음
      return forwardedFor.split(',')[0].trim();
    }
    if (realIp) {
      return realIp;
    }
    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    return null;
  } catch (error) {
    console.error('IP 주소 가져오기 실패:', error);
    return null;
  }
}

/**
 * 관리자 로그인 로그 기록
 */
export async function recordAdminLogin(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserProfile();
    if (!user) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다' };
    }

    const ipAddress = await getClientIp();
    await logAdminLogin(user.id, user.name || '알 수 없음', ipAddress);

    return { success: true };
  } catch (error) {
    console.error('관리자 로그인 로그 기록 실패:', error);
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
  }
}

/**
 * 로그인 실패 로그 기록
 */
export async function recordLoginFailed(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const ipAddress = await getClientIp();
    await logLoginFailed(email, ipAddress);

    return { success: true };
  } catch (error) {
    console.error('로그인 실패 로그 기록 실패:', error);
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
  }
}


export async function checkEmailConfirmed(email: string): Promise<{ success: boolean, error?: string }> {
  const { env } = await getCloudflareContext({ async: true });
  const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, verified:metadata->verified')
    .eq('email', email)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  if (!data) {
    return { success: false, error: 'email not found' };
  }

  if (!data.verified) {
    return { success: false, error: 'email not confirmed' };
  }

  return { success: data.verified as boolean };
}

export async function verifyTokenHash(token_hash: string, type: string): Promise<{ success: boolean, error?: string }> {
  const supabase = createAnonymousServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  })
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

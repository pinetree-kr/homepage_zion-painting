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



/**
 * 구글 OAuth URL 생성
 * Cloudflare Workers에서 crypto.randomUUID()를 지원합니다.
 */
export async function signInWithGoogle({
  redirectUri,
}: {
  redirectUri: string;
}): Promise<{ url: string; state: string }> {
  const { env } = await getCloudflareContext({ async: true });
  const clientId = env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('구글 클라이언트 ID가 설정되지 않았습니다.');
  }

  if (!redirectUri) {
    throw new Error('리다이렉트 URI가 설정되지 않았습니다.');
  }

  const scope = 'openid email profile';
  const responseType = 'code';
  // Cloudflare Workers는 crypto.randomUUID()를 지원합니다
  const state = crypto.randomUUID(); // CSRF 방지를 위한 state

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    state: state,
    access_type: 'offline',
    prompt: 'consent',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // URL과 state를 반환 (클라이언트에서 리다이렉트 처리)
  return {
    url: googleAuthUrl,
    state: state,
  };
}

// /**
//  * 구글 사용자 정보 타입
//  */
// interface GoogleUserInfo {
//   id: string;
//   email: string;
//   name: string;
//   picture?: string;
//   verified_email: boolean;
// }


// /**
//  * 구글 사용자 프로필 업데이트
//  */
// export async function updateGoogleUserProfile(
//   userId: string,
//   googleUser: GoogleUserInfo
// ): Promise<{ success: boolean; error?: string }> {
//   try {
//     const { env } = await getCloudflareContext({ async: true });
//     const secretSupabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

//     // profiles 테이블 업데이트
//     const { data: currentProfile } = await secretSupabase
//       .from('profiles')
//       .select('metadata')
//       .eq('id', userId)
//       .maybeSingle();

//     if (currentProfile) {
//       // 최근 로그인 정보외의 다른 정보를 업데이트하지는 않음, 다른 정보는 사용자 프로필에서 직접 수정 요청
//       const updatedMetadata = {
//         ...(currentProfile.metadata as object || {}),
//         last_login: new Date().toISOString(),
//         // verified: true,
//         // picture: googleUser.picture,
//         // provider: 'google',
//       };

//       const { error: updateError } = await secretSupabase
//         .from('profiles')
//         .update({
//           // name: googleUser.name,
//           // email: googleUser.email,
//           metadata: updatedMetadata,
//         })
//         .eq('id', userId);

//       if (updateError) {
//         console.error('프로필 업데이트 오류:', updateError);
//         return {
//           success: false,
//           error: updateError.message,
//         };
//       }
//     } else {
//       // profiles가 없으면 생성 (트리거가 실패한 경우)
//       const { error: insertError } = await secretSupabase
//         .from('profiles')
//         .insert({
//           id: userId,
//           name: googleUser.name,
//           email: googleUser.email,
//           metadata: {
//             picture: googleUser.picture,
//             provider: 'google',
//             verified: true,
//             last_login: new Date().toISOString(),
//           },
//         });

//       if (insertError) {
//         console.error('프로필 생성 오류:', insertError);
//         return {
//           success: false,
//           error: insertError.message,
//         };
//       }
//     }

//     return {
//       success: true,
//     };
//   } catch (error) {
//     console.error('구글 사용자 프로필 업데이트 중 오류 발생:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : '알 수 없는 오류',
//     };
//   }
// }
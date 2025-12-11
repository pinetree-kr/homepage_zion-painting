"use server"

import { headers } from 'next/headers';
import { logAdminLogin, logLoginFailed } from '@/src/entities/system';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';
import { createSecretClient } from '@/src/shared/lib/supabase/service';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import { CURRENT_TERMS_VERSION_DB } from '@/src/shared/lib/auth';

/**
 * 관리자 로그인 로그 기록
 */
export async function recordAdminLogin(ipAddress?: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserProfile();
    if (!user) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다' };
    }

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
export async function recordLoginFailed(email: string, ipAddress?: string | null): Promise<{ success: boolean; error?: string }> {
  try {
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

export async function verifyTokenHash(token_hash: string, type: string): Promise<{
  success: boolean, error?: string, data?: {
    user: {
      id: string;
      email?: string;
    }
  }
}> {
  const supabase = createAnonymousServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  })
  if (error) {
    return { success: false, error: error.message };
  }
  if (!data?.user?.id) {
    return { success: false, error: 'user not found' };
  }

  // OTP 인증 성공 후 약관 동의 정보를 user_metadata에 업데이트
  // 회원가입 시 약관 동의는 terms_agreements 테이블에 저장되지만,
  // user_metadata에는 저장되지 않아서 middleware에서 체크할 수 없음
  if (type === 'signup' || type === 'email') {
    try {
      const { env } = await getCloudflareContext({ async: true });
      const secretClient = await createSecretClient(env.SUPABASE_SECRET_KEY);

      // terms_agreements 테이블에서 약관 동의 정보 확인
      const { data: termsData, error: termsError } = await secretClient
        .from('terms_agreements')
        .select('agreement_type, agreed')
        .eq('user_id', data.user.id)
        .eq('version', CURRENT_TERMS_VERSION_DB)
        .eq('agreed', true);

      if (!termsError && termsData && termsData.length > 0) {
        const termsAgreed = termsData.some(item => item.agreement_type === 'terms');
        const privacyAgreed = termsData.some(item => item.agreement_type === 'privacy');

        // user_metadata 업데이트
        const currentMetadata = data.user.user_metadata || {};
        const updatedMetadata = {
          ...currentMetadata,
          terms_agreed_version: CURRENT_TERMS_VERSION_DB,
          ...(termsAgreed && { terms_agreed: true }),
          ...(privacyAgreed && { privacy_agreed: true }),
        };

        const { error: updateError } = await secretClient.auth.admin.updateUserById(
          data.user.id,
          {
            user_metadata: updatedMetadata,
          }
        );

        if (updateError) {
          console.error('user_metadata 업데이트 오류:', updateError);
          // metadata 업데이트 실패해도 인증은 성공으로 처리
        }
      }
    } catch (metadataError) {
      console.error('약관 동의 metadata 업데이트 중 오류 발생:', metadataError);
      // metadata 업데이트 실패해도 인증은 성공으로 처리
    }
  }

  return {
    success: true,
    data: {
      user: {
        id: data.user.id,
        email: data.user.email
      }
    }
  };
}

/**
 * 토큰을 사용하여 패스워드 설정/변경 (공통 함수)
 * recovery와 invite 타입 모두 지원
 * 토큰 검증과 패스워드 설정을 한 번에 처리
 */
export async function setPasswordWithToken(
  token_hash: string,
  type: 'recovery' | 'invite',
  password: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    // 1. 토큰 검증
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (verifyError || !verifyData?.user) {
      return {
        success: false,
        error: '링크가 만료되었거나 유효하지 않습니다.'
      };
    }

    const userId = verifyData.user.id;
    const currentMetadata = (verifyData.user.user_metadata || {}) as Record<string, any>;

    // 2. 패스워드 설정
    // password_required 플래그 제거 및 패스워드 설정 완료 표시
    const updatedMetadata: Record<string, any> = {
      ...currentMetadata,
      password_set: true,
      password_set_at: new Date().toISOString(),
    };

    // password_required가 있으면 제거
    if (updatedMetadata.password_required) {
      delete updatedMetadata.password_required;
    }

    if (updatedMetadata.invite_pending) {
      delete updatedMetadata.invite_pending;
    }

    if (updatedMetadata.role) {
      delete updatedMetadata.role;
    }

    // 패스워드 설정 시 user_metadata에 email_verified: true를 설정하여 인증 완료 상태로 만듦
    // 이렇게 하면 handle_verified_user 트리거가 자동으로 실행되어
    // profiles.metadata.verified와 administrators.metadata.verified를 업데이트함
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: password,
        user_metadata: {
          ...updatedMetadata,
          email_verified: true, // 이메일 인증 완료로 표시 (트리거가 verified를 true로 업데이트)
        },
      }
    );

    if (updateError) {
      return {
        success: false,
        error: '비밀번호 설정에 실패했습니다: ' + updateError.message
      };
    }

    // administrators.metadata.verified는 handle_verified_user 트리거가 자동으로 업데이트함
    // 패스워드 설정 시 email_confirm: true로 설정하면 트리거가 실행됨

    return { success: true, userId };
  } catch (error) {
    console.error('패스워드 설정 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '비밀번호 설정 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 약관 동의 저장
 */
export async function saveTermsAgreement(
  userId: string,
  agreementType: 'terms' | 'privacy',
  version: string,
  userAgent?: string | null,
  ipAddress?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);


    const { error } = await supabase
      .from('terms_agreements')
      .insert({
        user_id: userId,
        agreement_type: agreementType,
        version: version,
        agreed: true,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      });

    if (error) {
      console.error('약관 동의 저장 오류:', error);
      return {
        success: false,
        error: error.message,
      };
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
 * 사용자의 약관 동의 여부 확인
 * @param userId 사용자 ID
 * @param version 약관 버전 (YYYYMMDD 형식)
 * @returns 약관 동의 여부 (terms, privacy)
 */
export async function checkTermsAgreement(
  userId: string,
  version: string
): Promise<{ termsAgreed: boolean; privacyAgreed: boolean }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

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



/**
 * 구글 OAuth URL 생성
 * Cloudflare Workers에서 crypto.randomUUID()를 지원합니다.
 */
export async function signInWithGoogle({
  redirectUri,
  linkUserId,
}: {
  redirectUri: string;
  linkUserId?: string;
}): Promise<{ url: string; nonce: string }> {
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
  const nonce = crypto.randomUUID(); // CSRF 방지를 위한 nonce

  const state = JSON.stringify({
    nonce,
    linkUserId,
  });

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
    nonce,
  };
}

/**
 * 카카오 OAuth URL 생성
 * Cloudflare Workers에서 crypto.randomUUID()를 지원합니다.
 */
export async function signInWithKakao({
  redirectUri,
  linkUserId,
}: {
  redirectUri: string;
  linkUserId?: string;
}): Promise<{ url: string; nonce: string }> {
  const { env } = await getCloudflareContext({ async: true });
  const clientId = env.KAKAO_CLIENT_ID;

  if (!clientId) {
    throw new Error('카카오 클라이언트 ID가 설정되지 않았습니다.');
  }

  if (!redirectUri) {
    throw new Error('리다이렉트 URI가 설정되지 않았습니다.');
  }

  const scope = 'profile_nickname profile_image account_email';
  const responseType = 'code';
  // Cloudflare Workers는 crypto.randomUUID()를 지원합니다
  const nonce = crypto.randomUUID(); // CSRF 방지를 위한 nonce

  const state = JSON.stringify({
    nonce,
    linkUserId,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    state: state,
  });

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;

  // URL과 state를 반환 (클라이언트에서 리다이렉트 처리)
  return {
    url: kakaoAuthUrl,
    nonce,
  };
}

/**
 * 카카오 access token으로 사용자 정보 가져오기 및 Supabase 세션 생성
 */
export async function verifyKakaoTokenAndCreateSession(
  accessToken: string,
  currentUserId?: string
): Promise<{ success: boolean; error?: string; sessionToken?: string; userId?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    // 카카오 사용자 정보 가져오기
    const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      return { success: false, error: '카카오 사용자 정보를 가져올 수 없습니다.' };
    }

    interface KakaoUser {
      id: number;
      kakao_account?: {
        email?: string;
        profile?: {
          nickname?: string;
          profile_image_url?: string;
        };
      };
    }

    const kakaoUser = await userInfoResponse.json() as KakaoUser;
    const email = kakaoUser.kakao_account?.email;
    const nickname = kakaoUser.kakao_account?.profile?.nickname || '';
    const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url || '';

    if (!email) {
      return { success: false, error: '카카오 계정에 이메일 정보가 없습니다. 이메일 동의가 필요합니다.' };
    }

    let userId: string | undefined;
    let isLinking = false;

    // 1. 현재 세션이 있으면 그 사용자로 연동 (명시적 계정 연동)
    if (currentUserId) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id, metadata, email')
        .eq('id', currentUserId)
        .is('deleted_at', null)
        .maybeSingle();

      if (currentProfile) {
        userId = currentProfile.id;
        isLinking = true;

        const currentMetadata = (currentProfile.metadata as Record<string, any>) || {};
        const linkedProviders = currentMetadata.linked_providers || [];

        // 이미 연결된 provider가 아니면 추가
        if (!linkedProviders.includes('kakao')) {
          linkedProviders.push('kakao');
        }

        // metadata 업데이트
        const updatedMetadata = {
          ...currentMetadata,
          linked_providers: linkedProviders,
          kakao_id: String(kakaoUser.id),
          last_login: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ metadata: updatedMetadata })
          .eq('id', currentUserId);

        if (updateError) {
          console.error('프로필 업데이트 오류:', updateError);
        }
      }
    }

    // 2. 이메일로 기존 사용자 찾기
    if (!userId && email) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, metadata')
        .eq('email', email)
        .is('deleted_at', null)
        .maybeSingle();

      if (existingProfile) {
        userId = existingProfile.id;
        isLinking = true;

        // metadata에 연결된 provider 정보 추가
        const currentMetadata = (existingProfile.metadata as Record<string, any>) || {};
        const linkedProviders = currentMetadata.linked_providers || [];

        // 이미 연결된 provider가 아니면 추가
        if (!linkedProviders.includes('kakao')) {
          linkedProviders.push('kakao');
        }

        // metadata 업데이트
        const updatedMetadata = {
          ...currentMetadata,
          linked_providers: linkedProviders,
          kakao_id: String(kakaoUser.id),
          last_login: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ metadata: updatedMetadata })
          .eq('id', userId);

        if (updateError) {
          console.error('프로필 업데이트 오류:', updateError);
        }
      }
    }

    // 3. 카카오 ID로 기존 사용자 찾기 (이메일이 다른 경우 대비)
    if (!userId) {
      const { data: existingByKakaoId } = await supabase
        .from('profiles')
        .select('id, metadata, email')
        .eq('metadata->>kakao_id', String(kakaoUser.id))
        .is('deleted_at', null)
        .maybeSingle();

      if (existingByKakaoId) {
        userId = existingByKakaoId.id;
        isLinking = true;

        const currentMetadata = (existingByKakaoId.metadata as Record<string, any>) || {};
        const linkedProviders = currentMetadata.linked_providers || [];

        if (!linkedProviders.includes('kakao')) {
          linkedProviders.push('kakao');
        }

        // 이메일이 다를 수 있으므로 카카오 이메일도 업데이트 (선택적)
        const updatedMetadata = {
          ...currentMetadata,
          linked_providers: linkedProviders,
          kakao_id: String(kakaoUser.id),
          last_login: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ metadata: updatedMetadata })
          .eq('id', userId);

        if (updateError) {
          console.error('프로필 업데이트 오류:', updateError);
        }
      }
    }

    // 4. 새 사용자 생성
    if (!userId) {
      // 새 사용자 생성
      // 카카오 사용자 ID를 기반으로 고유한 비밀번호 생성 (실제로는 사용하지 않음)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          name: nickname,
          provider: 'kakao',
          kakao_id: String(kakaoUser.id),
          picture: profileImage,
        },
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || '사용자 생성에 실패했습니다.' };
      }

      userId = authData.user.id;

      // profiles 테이블은 트리거에 의해 자동 생성되지만, 잠시 대기 후 업데이트
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          name: nickname,
          email: email,
          metadata: {
            signup_provider: 'kakao',
            linked_providers: ['kakao'],
            kakao_id: String(kakaoUser.id),
            picture: profileImage,
            verified: true,
            last_login: new Date().toISOString(),
          },
        })
        .eq('id', userId);

      if (profileUpdateError) {
        console.error('프로필 업데이트 오류:', profileUpdateError);
      }
    }

    // 마법 링크를 생성하여 세션 토큰 생성
    // userId가 있으면 해당 사용자의 이메일 사용 (계정 연동 시)
    let emailForLink = email;
    if (userId && isLinking) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .maybeSingle();
      if (userProfile?.email) {
        emailForLink = userProfile.email;
      }
    }

    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:8080';
    const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const siteUrl = `${protocol}://${host}`;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: emailForLink,
      options: {
        redirectTo: `${siteUrl}/auth/callback/kakao?session=true`,
      },
    });

    if (linkError || !linkData) {
      return { success: false, error: linkError?.message || '세션 생성에 실패했습니다.' };
    }

    // 링크에서 토큰 추출
    const url = new URL(linkData.properties.action_link);
    const tokenHash = url.searchParams.get('token_hash') || url.hash.split('token_hash=')[1]?.split('&')[0];

    return { success: true, sessionToken: tokenHash || linkData.properties.action_link, userId };
  } catch (error) {
    console.error('카카오 토큰 검증 및 세션 생성 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 구글 계정이 이미 다른 계정에 연결되어 있는지 확인
 */
export async function checkGoogleAccountConflict(
  googleEmail: string,
  currentUserId: string
): Promise<{ hasConflict: boolean; existingUserId?: string; error?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    // 1. 구글 이메일로 이미 존재하는 프로필 확인
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', googleEmail)
      .neq('id', currentUserId) // 현재 사용자 제외
      .is('deleted_at', null)
      .maybeSingle();

    if (profileError) {
      console.error('프로필 조회 오류:', profileError);
      return { hasConflict: false };
    }

    if (existingProfile) {
      // 2. 해당 프로필의 auth.identities에서 구글 identity 확인
      const { data: authUser } = await supabase.auth.admin.getUserById(existingProfile.id);
      const hasGoogleIdentity = authUser?.user?.identities?.some(
        (identity: any) => identity.provider === 'google'
      ) || false;

      if (hasGoogleIdentity) {
        return {
          hasConflict: true,
          existingUserId: existingProfile.id,
        };
      }
    }

    return { hasConflict: false };
  } catch (error) {
    console.error('구글 계정 충돌 확인 중 오류 발생:', error);
    return {
      hasConflict: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 구글 identity를 특정 사용자 계정에 연결
 */
export async function linkGoogleIdentityToUser(
  targetUserId: string,
  googleUserId: string,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    // 구글 사용자의 identity 정보 가져오기
    const { data: googleAuthUser } = await supabase.auth.admin.getUserById(googleUserId);

    if (!googleAuthUser?.user) {
      return { success: false, error: '구글 계정을 찾을 수 없습니다.' };
    }

    // 구글 identity 찾기
    const googleIdentity = googleAuthUser.user.identities?.find(
      (identity: any) => identity.provider === 'google'
    );

    if (!googleIdentity) {
      return { success: false, error: '구글 identity를 찾을 수 없습니다.' };
    }

    // targetUserId에 구글 identity 연결
    // Supabase Admin API를 사용하여 identity 연결
    // 주의: linkIdentity는 identity ID가 필요하지만, Supabase는 이를 직접 제공하지 않음
    // 대신, 구글 계정을 삭제하고 targetUserId에 새로 연결해야 할 수 있음

    // 임시 해결책: 구글 계정의 identity 정보를 targetUserId에 복사
    // 실제로는 Supabase의 linkIdentity API를 사용해야 하지만,
    // 현재 구조에서는 복잡하므로 에러를 반환하고 사용자에게 안내

    return {
      success: false,
      error: '계정 연동 기능은 준비 중입니다. 잠시 후 다시 시도해주세요.',
    };
  } catch (error) {
    console.error('구글 identity 연결 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 구글 로그인 후 프로필 업데이트 (계정 연동 포함)
 */
export async function updateGoogleUserProfileAfterLogin(
  userId: string,
  googleEmail?: string,
): Promise<{ success: boolean; error?: string; isLinking?: boolean }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    // 구글 이메일이 제공된 경우, 계정 충돌 확인
    if (googleEmail) {
      const conflictCheck = await checkGoogleAccountConflict(googleEmail, userId);
      if (conflictCheck.hasConflict) {
        return {
          success: false,
          error: '이 구글 계정은 이미 다른 계정에 연결되어 있습니다. 기존 계정으로 로그인해주세요.',
        };
      }
    }

    // profiles 테이블에서 현재 사용자 정보 가져오기
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('metadata, email')
      .eq('id', userId)
      .maybeSingle();

    if (!currentProfile) {
      return { success: false, error: '프로필을 찾을 수 없습니다.' };
    }

    const currentMetadata = (currentProfile.metadata as Record<string, any>) || {};
    const linkedProviders = currentMetadata.linked_providers || [];
    let isLinking = false;

    // 구글 provider가 이미 연결되어 있는지 확인
    // Supabase의 auth.identities를 확인하여 구글 identity가 있는지 체크
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);

    if (authUser?.user) {
      // auth.identities에서 구글 provider 확인
      const hasGoogleIdentity = authUser.user.identities?.some(
        (identity: any) => identity.provider === 'google'
      ) || false;

      // 구글이 연결되어 있지만 metadata에 없으면 추가
      if (hasGoogleIdentity && !linkedProviders.includes('google')) {
        linkedProviders.push('google');
        isLinking = true;
      }

      // 구글이 이미 metadata에 있지만 identity에 없으면 추가 (동기화)
      if (linkedProviders.includes('google') && !hasGoogleIdentity) {
        // identity는 Supabase가 자동으로 관리하므로 여기서는 metadata만 업데이트
        isLinking = true;
      }
    } else {
      // auth user가 없으면 새로 생성된 사용자이므로 구글을 linked_providers에 추가
      if (!linkedProviders.includes('google')) {
        linkedProviders.push('google');
      }
    }

    // metadata 업데이트
    const updatedMetadata: Record<string, any> = {
      ...currentMetadata,
      linked_providers: linkedProviders.length > 0 ? linkedProviders : ['google'],
      last_login: new Date().toISOString(),
    };

    // signup_provider가 없으면 구글로 설정
    if (!updatedMetadata.signup_provider) {
      updatedMetadata.signup_provider = 'google';
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', userId);

    if (updateError) {
      console.error('프로필 업데이트 오류:', updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    return {
      success: true,
      isLinking,
    };
  } catch (error) {
    console.error('구글 사용자 프로필 업데이트 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 연결된 계정 목록 조회
 */
export async function getLinkedAccounts(
  userId: string
): Promise<{ success: boolean; providers?: string[]; error?: string }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    // profiles에서 metadata 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return { success: false, error: '프로필을 찾을 수 없습니다.' };
    }

    const metadata = (profile.metadata as Record<string, any>) || {};
    const linkedProviders = metadata.linked_providers || [];
    const signupProvider = metadata.signup_provider || 'email';

    // Supabase auth.identities에서도 확인
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const identities = authUser?.user?.identities || [];

    // identities에서 provider 목록 추출
    const identityProviders = identities.map((identity: any) => identity.provider);

    // 두 목록을 합치고 중복 제거
    let allProviders = Array.from(new Set([...linkedProviders, ...identityProviders]));

    // signup_provider는 제외 (처음 가입한 방법이므로 "연결된" 계정이 아님)
    allProviders = allProviders.filter(provider => provider !== signupProvider);

    // signup_provider가 'email'이 아닌 경우, 'email' provider도 제외
    // (구글/카카오 등으로 가입한 경우 이메일 identity가 있어도 연동된 것이 아님)
    if (signupProvider !== 'email') {
      allProviders = allProviders.filter(provider => provider !== 'email');
    }

    return {
      success: true,
      providers: allProviders,
    };
  } catch (error) {
    console.error('연결된 계정 조회 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
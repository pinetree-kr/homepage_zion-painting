import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import VerifyKakaoToken from '@/src/features/auth/ui/VerifyKakaoToken';

interface KakaoCallbackPageProps {
  searchParams: Promise<{
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  }>;
}

/**
 * 카카오 OAuth authorization code를 access token으로 교환
 */
async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; id_token?: string }> {
  const tokenUrl = 'https://kauth.kakao.com/oauth/token';

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json() as { error?: string; error_description?: string };
      errorMessage = errorData.error_description || errorData.error || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(`토큰 교환 실패: ${errorMessage}`);
  }

  return await response.json();
}

/**
 * 카카오 access token으로 사용자 정보 가져오기
 */
async function getUserInfo(accessToken: string): Promise<{
  id: string;
  kakao_account: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
  };
}> {
  const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`사용자 정보 가져오기 실패: ${response.statusText}`);
  }

  return await response.json();
}

export default async function KakaoCallbackPage({ searchParams }: KakaoCallbackPageProps) {
  const params = await searchParams;

  // 에러가 있는 경우
  if (params.error) {
    console.error('카카오 로그인 오류:', params.error, params.error_description);
    redirect('/auth/sign-in?error=kakao_auth_failed');
  }

  // 코드가 없는 경우
  if (!params.code) {
    redirect('/auth/sign-in?error=no_code');
  }

  let accessToken: string | null = null;
  let idToken: string | null = null;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const clientId = env.KAKAO_CLIENT_ID;
    const clientSecret = env.KAKAO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('카카오 OAuth 설정이 없습니다.');
      redirect('/auth/sign-in?error=config_error');
    }

    // 동적으로 redirect URI 생성
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:8080';
    const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const redirectUri = `${protocol}://${host}/auth/callback/kakao`;

    // Authorization code를 access token으로 교환
    const tokenData = await exchangeCodeForToken(
      params.code,
      clientId,
      clientSecret,
      redirectUri
    );

    console.log('tokenData', { tokenData });

    accessToken = tokenData?.access_token || null;
    // 카카오는 id_token을 제공하지 않으므로 access_token을 사용
    idToken = tokenData?.access_token || null;

  } catch (err) {
    console.error('카카오 콜백 처리 중 오류 발생:', err);
    redirect('/auth/sign-in?error=callback_error');
  }

  if (!accessToken || !idToken) {
    redirect('/auth/sign-in?error=token_exchange_failed');
  }

  return <VerifyKakaoToken accessToken={accessToken} idToken={idToken} />;
}


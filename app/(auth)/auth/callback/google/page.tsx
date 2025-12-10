import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import VerifyGoogleToken from '@/src/features/auth/ui/VerifyGoogleToken';

interface GoogleCallbackPageProps {
  searchParams: Promise<{
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  }>;
}

/**
 * 구글 OAuth authorization code를 access token으로 교환
 */
async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; id_token?: string }> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';

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
      const errorData = await response.json() as { error?: string };
      errorMessage = errorData.error || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(`토큰 교환 실패: ${errorMessage}`);
  }

  return await response.json();
}

/**
 * 구글 access token으로 사용자 정보 가져오기
 */
async function getUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}> {
  const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

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

export default async function GoogleCallbackPage({ searchParams }: GoogleCallbackPageProps) {
  const params = await searchParams;

  // 에러가 있는 경우
  if (params.error) {
    console.error('구글 로그인 오류:', params.error, params.error_description);
    redirect('/auth/sign-in?error=google_auth_failed');
  }

  // 코드가 없는 경우
  if (!params.code) {
    redirect('/auth/sign-in?error=no_code');
  }

  let accessToken: string | null = null;
  let idToken: string | null = null;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('구글 OAuth 설정이 없습니다.');
      redirect('/auth/sign-in?error=config_error');
    }

    // 동적으로 redirect URI 생성
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:8080';
    const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const redirectUri = `${protocol}://${host}/auth/callback/google`;

    // Authorization code를 access token으로 교환
    const tokenData = await exchangeCodeForToken(
      params.code,
      clientId,
      clientSecret,
      redirectUri
    );

    console.log('tokenData', { tokenData });

    accessToken = tokenData?.access_token || null;
    idToken = tokenData?.id_token || null;


    // console.log('tokenData', tokenData);

    // Access token으로 사용자 정보 가져오기
    // const googleUser = await getUserInfo(tokenData.access_token);

    // console.log('googleUser', googleUser);

    // if (!googleUser.email || !googleUser.verified_email) {
    //   redirect('/auth/sign-in?error=email_not_verified');
    // }

    // Supabase에서 사용자 찾기 또는 생성
    // const userResult = await findOrCreateGoogleUser(googleUser);

    // if (!userResult.success || !userResult.data?.user_id) {
    //   console.error('사용자 찾기/생성 실패:', userResult.error);
    //   redirect('/auth/sign-in?error=user_creation_failed');
    // }

    // const userId = userResult.data.user_id;

    // // 프로필 업데이트
    // const profileResult = await updateGoogleUserProfile(userId, googleUser);

    // if (!profileResult.success) {
    //   console.error('프로필 업데이트 실패:', profileResult.error);
    //   // 프로필 업데이트 실패해도 로그인은 계속 진행
    // }

    // 로그인 성공 시 홈으로 리다이렉트
    // redirect('/');
  } catch (err) {
    console.error('구글 콜백 처리 중 오류 발생:', err);
    redirect('/auth/sign-in?error=callback_error');
  }

  if (!accessToken || !idToken) {
    redirect('/auth/sign-in?error=token_exchange_failed');
  }

  return <VerifyGoogleToken accessToken={accessToken} idToken={idToken} />;
}

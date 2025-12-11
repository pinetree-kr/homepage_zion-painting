import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';
import { checkTermsAgreementServer } from '@/src/entities/user/model/checkTermsAgreement';
import ProfileClient from './ProfileClient';
import { CURRENT_TERMS_VERSION_DB } from '@/src/shared/lib/auth';

interface ProfilePageProps {
  searchParams: Promise<{
    terms_required?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;

  // 사용자 정보 가져오기
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // 관리자 여부 확인
  const { createServerClient } = await import('@/src/shared/lib/supabase/server');
  const supabase = await createServerClient();
  const { data: adminData } = await supabase
    .from('administrators')
    .select('id')
    .eq('id', user.id)
    .is('deleted_at', null)
    .maybeSingle();

  const isAdmin = adminData !== null;

  // 약관 동의 여부 확인 (관리자는 제외)
  let termsRequired = false;
  if (!isAdmin) {
    const { termsAgreed, privacyAgreed } = await checkTermsAgreementServer(
      user.id,
      CURRENT_TERMS_VERSION_DB
    );

    // 약관 동의가 안 되어 있으면 termsRequired를 true로 설정
    termsRequired = !termsAgreed || !privacyAgreed;

    // 쿼리 파라미터가 'true'이거나 약관 동의가 필요한 경우 termsRequired를 true로 설정
    if (params.terms_required === 'true' || termsRequired) {
      termsRequired = true;
    }
  }

  return <ProfileClient user={user} termsRequired={termsRequired} />;
}


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
  const { terms_required } = await searchParams;

  // 사용자 정보 가져오기
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const { termsAgreed, privacyAgreed } = await checkTermsAgreementServer(
    user.id,
    CURRENT_TERMS_VERSION_DB
  );

  // 약관 동의가 안 되어 있으면 termsRequired를 true로 설정
  // 쿼리 파라미터가 'true'이거나 약관 동의가 필요한 경우 termsRequired를 true로 설정
  const termsRequired = (terms_required === 'true' || !termsAgreed || !privacyAgreed);

  return <ProfileClient user={user} termsRequired={termsRequired} />;
}


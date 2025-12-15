import { redirect } from 'next/navigation';
import { createServerClient } from '@/src/shared/lib/supabase/server';
import TermsAgreementPageClient from '@/src/features/auth/ui/TermsAgreementPageClient';

export default async function TermsAgreementPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!user) {
    redirect('/auth/sign-in');
  }

  return <TermsAgreementPageClient userId={user.id} />;
}


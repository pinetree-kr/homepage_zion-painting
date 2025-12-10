import { notFound } from 'next/navigation';

import VerifyEmailToken from '@/src/features/auth/ui/VerifyEmailToken';

interface CallbackPageProps {
  searchParams: Promise<{ email?: string, token_hash?: string }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const { email, token_hash } = await searchParams;

  if (!email || !token_hash) {
    notFound();
  }

  return <VerifyEmailToken email={email} token_hash={token_hash} />;
}


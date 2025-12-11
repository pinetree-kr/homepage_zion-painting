import { notFound } from 'next/navigation';

import Welcome from '@/src/features/auth/ui/Welcome';



interface CallbackPageProps {
  searchParams: Promise<{ email?: string, error?: string }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const { email, error } = await searchParams;

  if (!email) {
    notFound();
  }

  return <Welcome email={email} error={error || ''} />;
}


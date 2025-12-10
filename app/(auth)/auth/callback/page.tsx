import { notFound } from 'next/navigation';

import Welcome from '@/src/features/auth/ui/Welcome';



interface CallbackPageProps {
  searchParams: Promise<{ email?: string, requested?: boolean }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const { email, requested = false } = await searchParams;

  if (!email) {
    notFound();
  }

  return <Welcome email={email} requested={requested} />;
}


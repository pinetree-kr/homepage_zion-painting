import { notFound } from 'next/navigation';
import SetPasswordForm from '@/src/features/auth/ui/SetPasswordForm';

interface SetPasswordPageProps {
  searchParams: Promise<{ 
    token_hash?: string;
    type?: 'recovery' | 'invite';
    email?: string;
  }>;
}

export default async function SetPasswordPage({ searchParams }: SetPasswordPageProps) {
  const { token_hash, type, email } = await searchParams;

  if (!token_hash || !type) {
    notFound();
  }

  // type이 recovery 또는 invite가 아니면 404
  if (type !== 'recovery' && type !== 'invite') {
    notFound();
  }

  return (
    <SetPasswordForm 
      token_hash={token_hash}
      type={type}
      email={email}
    />
  );
}


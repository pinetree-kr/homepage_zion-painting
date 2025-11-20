import { AdminLayout } from '@/src/features/layout';
import { isAdmin } from '@/src/entities/user';
import { redirect } from 'next/navigation';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!await isAdmin()) {
    redirect('/auth/sign-in');
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}


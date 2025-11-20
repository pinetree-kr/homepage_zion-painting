import AdminLayout from '@/src/features/layout/AdminLayout';
import { isAdmin } from '@/src/entities/user/model/checkPermission';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

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


import { AdminLayout } from '@/src/features/layout';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}


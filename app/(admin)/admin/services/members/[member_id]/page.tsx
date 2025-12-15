import MemberDetail from '@/src/features/management-user/ui/MemberDetail';
import { getUserUsingAdmin } from '@/src/features/management-user/api/user-actions';
import { redirect } from 'next/navigation';

interface MemberDetailPageProps {
  params: Promise<{
    member_id: string;
  }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { member_id } = await params;
  const member = await getUserUsingAdmin(member_id);

  if (!member) {
    redirect('/admin/services/members');
  }

  return (
    <MemberDetail member={member} />
  );
}


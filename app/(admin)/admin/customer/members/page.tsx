import ManagementCustomerMembersPage from '@/src/pages/management-customer-members';

interface MembersPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  return <ManagementCustomerMembersPage searchParams={searchParams} />;
}


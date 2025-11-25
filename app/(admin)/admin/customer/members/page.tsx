import Members from '@/src/features/management-user/ui/Members';
import { searchUsersUsingAdmin } from '@/src/features/management-user/api/user-actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MembersPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const searchParamsData = await searchParams;
  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  
  const result = await searchUsersUsingAdmin(searchTerm, page, ITEMS_PER_PAGE);
  
  return (
    <Members 
      items={result.data}
      totalItems={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      searchTerm={searchTerm}
    />
  );
}


import BusinessAchievements from '@/src/features/management-business/ui/BusinessAchievements';
import {
  getBusinessCategories,
  searchBusinessAchievementsUsingAdmin,
} from '@/src/features/management-business/api/business-actions';

interface BusinessAchievementsPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ITEMS_PER_PAGE = 10;

export default async function BusinessAchievementsPage({ searchParams }: BusinessAchievementsPageProps) {
  const searchParamsData = await searchParams;
  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  const sortColumn = searchParamsData?.sort || null;
  const sortDirection = (searchParamsData?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  const [result, categories] = await Promise.all([
    searchBusinessAchievementsUsingAdmin(searchTerm, page, ITEMS_PER_PAGE, sortColumn, sortDirection),
    getBusinessCategories(),
  ]);

  return (
    <BusinessAchievements
      categories={categories}
      items={result.data}
      totalItems={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      searchTerm={searchTerm}
    />
  );
}
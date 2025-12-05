import { BoardManagement } from '@/src/features/board/ui';
import { getBoardsUsingAdmin } from '@/src/features/board/api/board-actions';

interface BoardsPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function ManagementSystemBoardsListPage({ searchParams }: BoardsPageProps) {
  const searchParamsData = await searchParams;
  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  const sortColumn = searchParamsData?.sort || null;
  const sortDirection = (searchParamsData?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  const result = await getBoardsUsingAdmin(searchTerm, page, ITEMS_PER_PAGE, sortColumn, sortDirection);

  return (
    <BoardManagement
      items={result.data}
      totalItems={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      searchTerm={searchTerm}
    />
  );
}


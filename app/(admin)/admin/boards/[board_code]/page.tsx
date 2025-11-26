import Posts from '@/src/features/post/ui/Posts';
import { getBoardInfoUsingAdmin } from '@/src/features/board/api/board-actions';
import { searchPostsByBoardCodeUsingAdmin } from '@/src/features/post/api/post-actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

interface BoardPageProps {
  params: Promise<{
    board_code: string;
  }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const { board_code } = await params;
  const searchParamsData = await searchParams;
  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  const sortColumn = searchParamsData?.sort || null;
  const sortDirection = (searchParamsData?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  const boardInfo = await getBoardInfoUsingAdmin(board_code);

  if (!boardInfo) {
    return notFound();
  }

  const result = await searchPostsByBoardCodeUsingAdmin(board_code, searchTerm, page, ITEMS_PER_PAGE, sortColumn, sortDirection);

  return (
    <Posts
      boardCode={board_code}
      boardName={boardInfo.name}
      items={result.data}
      totalItems={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      searchTerm={searchTerm}
    />
  );
}


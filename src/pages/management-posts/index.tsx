"use server"

import Posts from '@/src/features/post/ui/Posts';
import { getBoardInfoUsingAdmin } from '@/src/features/board/api/board-actions';
import { searchPostsByBoardCodeUsingAdmin } from '@/src/features/post/api/post-actions';
import { notFound } from 'next/navigation';

interface ManagementBoardPageProps {
  params: Promise<{
    board_code: string;
  }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function ManagementBoardPage({ params, searchParams }: ManagementBoardPageProps) {
  const { board_code } = await params;
  const searchParamsData = await searchParams;
  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);

  const boardInfo = await getBoardInfoUsingAdmin(board_code);

  if (!boardInfo) {
    return notFound();
  }

  const result = await searchPostsByBoardCodeUsingAdmin(board_code, searchTerm, page, ITEMS_PER_PAGE);

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


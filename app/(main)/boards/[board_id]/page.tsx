import { notFound, redirect } from 'next/navigation';
import { getBoardInfoByIdUsingAnonymous, getBoardPoliciesUsingAnonymous } from '@/src/features/board/api/board-actions';
import { searchPostsByBoardCodeUsingAnonymous, getPostUsingAnonymous } from '@/src/features/post/api/post-actions';
import { getPostFiles } from '@/src/features/post/api/post-file-actions';
import PublicPosts from '@/src/features/post/ui/PublicPosts';
import PostDetail from '@/src/features/post/ui/PostDetail';
import PostCreateButton from '@/src/features/post/ui/PostCreateButton';
import { Button } from '@/src/shared/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

interface BoardsPageProps {
  params: Promise<{
    board_id: string;
  }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function BoardsPage({ params, searchParams }: BoardsPageProps) {
  const searchParamsData = await searchParams;
  const { board_id } = await params;

  // board_id는 필수
  if (!board_id) {
    return notFound();
  }

  // 게시판 정보 조회
  const boardInfo = await getBoardInfoByIdUsingAnonymous(board_id);
  const boardPolicies = await getBoardPoliciesUsingAnonymous(board_id);

  if (!boardInfo) {
    return notFound();
  }

  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  const sortColumn = searchParamsData?.sort || null;
  const sortDirection = (searchParamsData?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  const result = await searchPostsByBoardCodeUsingAnonymous(board_id, searchTerm, page, ITEMS_PER_PAGE, sortColumn, sortDirection);

  return (
    <div className="relative bg-[#F4F6F8] min-h-[calc(100vh-405px)]">
      <div className="lg:max-w-6xl mx-auto px-4 pt-24 pb-8 md:pt-34 md:pb-18">
        <PublicPosts
          boardId={board_id}
          boardName={boardInfo.name}
          boardPolicies={boardPolicies}
          items={result.data}
          totalItems={result.total}
          totalPages={result.totalPages}
          currentPage={page}
          searchTerm={searchTerm}
          createButton={<PostCreateButton boardId={board_id} boardInfo={boardInfo} boardPolicies={boardPolicies} />}
        />
      </div>
    </div>
  );
}

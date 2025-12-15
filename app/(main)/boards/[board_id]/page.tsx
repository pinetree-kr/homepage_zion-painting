import { notFound } from 'next/navigation';
import { getBoardInfoByIdUsingAnonymous, getBoardPoliciesUsingAnonymous } from '@/src/features/board/api/board-actions';
import { searchPostsByBoardIdUsingAnonymous, searchPostsByBoardIdUsing1To1Board } from '@/src/features/post/api/post-actions';
import PublicPosts from '@/src/features/post/ui/PublicPosts';
import PostCreateButton from '@/src/features/post/ui/PostCreateButton';
import { getUserRole } from '@/src/entities/user/model/checkPermission';
import { Post } from '@/src/entities/post/model/types';
import BoardError from './error';

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

  // 사용자 롤 확인
  const userRoleInfo = await getUserRole();

  // 권한 체크
  // 1. 목록 접근 권한
  let canList = false;

  if (boardInfo.visibility === 'public') {
    canList = true;
  } else {
    canList = boardPolicies.find(p => p.role === userRoleInfo?.role)?.post_list ?? false;
  }

  if (!canList) {
    if (userRoleInfo == null) {
      return (
        <BoardError statusCode={401} error={new Error('로그인이 필요합니다.')} />
      )
    } else {
      return (
        <BoardError statusCode={403} error={new Error('게시판 접근 권한이 없습니다.')} />
      )
    }
  }

  // 2. 쓰기 권한
  const canWrite = boardPolicies.find(p => p.role === userRoleInfo?.role)?.post_create ?? false;

  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  const sortColumn = searchParamsData?.sort || null;
  const sortDirection = (searchParamsData?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';


  let result: { data: Post[]; total: number; totalPages: number } | null = null;

  // 만약 visibility가 owner이면, 본인 게시물만 조회 가능
  if (boardInfo.visibility === 'owner' && userRoleInfo?.user_id) {
    result = await searchPostsByBoardIdUsing1To1Board(board_id, userRoleInfo.user_id, searchTerm, page, ITEMS_PER_PAGE, sortColumn, sortDirection);
  } else {
    result = await searchPostsByBoardIdUsingAnonymous(board_id, searchTerm, page, ITEMS_PER_PAGE, sortColumn, sortDirection);
  }

  return (
    <div className="relative bg-[#F4F6F8] min-h-[calc(100vh-405px)]">
      <div className="lg:max-w-6xl mx-auto px-4 pt-24 pb-8 md:pt-34 md:pb-18">
        <PublicPosts
          boardId={board_id}
          boardName={boardInfo.name}
          items={result?.data || []}
          totalItems={result?.total || 0}
          totalPages={result?.totalPages || 0}
          currentPage={page}
          searchTerm={searchTerm}
          createButton={
            <PostCreateButton boardId={board_id} allowWrite={canWrite} />
          }
        />
      </div>
    </div>
  );
}

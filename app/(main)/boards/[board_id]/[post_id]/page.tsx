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
    post_id: string;
  }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string | null;
    order?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function BoardsPage({ params, searchParams }: BoardsPageProps) {
  const searchParamsData = await searchParams;
  const { board_id, post_id } = await params;

  // board_id와 post_id는 필수
  if (!board_id || !post_id) {
    return notFound();
  }

  // 게시판 정보 조회
  const boardInfo = await getBoardInfoByIdUsingAnonymous(board_id);
  const boardPolicies = await getBoardPoliciesUsingAnonymous(board_id);

  if (!boardInfo) {
    return notFound();
  }

  if (!post_id) {
    return notFound();
  }

  const post = await getPostUsingAnonymous(post_id);

  if (!post) {
    return notFound();
  }

  // 첨부 파일 목록 가져오기
  const attachedFiles = await getPostFiles(post_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href={`/boards/${board_id}`}>
          <Button
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> 목록으로
          </Button>
        </Link>
      </div>

      <PostDetail
        post={post}
        boardId={boardInfo.id}
        boardCode={boardInfo.code}
        boardName={boardInfo.name}
        boardPolicies={boardPolicies}
        allowComment={boardInfo.allow_comment}
        attachedFiles={attachedFiles}
        isPublic={true}
      />
    </div>
  );
}

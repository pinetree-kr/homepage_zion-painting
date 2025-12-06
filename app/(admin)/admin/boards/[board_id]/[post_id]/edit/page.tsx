import { getBoardInfoUsingAdminById, getBoardPolicies, checkBoardSupportsProductLinking } from '@/src/features/board/api/board-actions';
import PostForm from '@/src/features/post/ui/PostForm';
import { getPostUsingAdmin } from '@/src/features/post/api/post-actions';
import { notFound, redirect } from 'next/navigation';

interface PostEditPageProps {
  params: Promise<{
    post_id: string;
    board_id: string;
  }>;
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const { post_id, board_id } = await params;
  const boardInfo = await getBoardInfoUsingAdminById(board_id);

  if (!boardInfo) {
    return notFound();
  }

  const post = await getPostUsingAdmin(post_id);

  if (!post) {
    redirect(`/admin/boards/${board_id}`);
  }

  const boardPolicies = await getBoardPolicies(board_id);
  // 서버 사이드에서 visibility 확인: 'public'이면 비로그인 사용자도 게시글 작성 가능
  const allowGuest = boardInfo.visibility === 'public';
  // 서버 사이드에서 board_id 기반으로 제품 연결 가능 여부 확인
  const allowProductLink = await checkBoardSupportsProductLinking(board_id);

  return (
    <PostForm
      boardCode={boardInfo.code}
      boardId={boardInfo.id}
      boardName={boardInfo.name}
      allowGuest={allowGuest}
      allowProductLink={allowProductLink}
      boardPolicies={boardPolicies}
      postId={post_id}
      data={post}
    />
  );
}


import PostDetail from '@/src/features/post/ui/PostDetail';
import { getBoardInfoUsingAdmin } from '@/src/features/board/api/board-actions';
import { getPostUsingAdmin } from '@/src/features/post/api/post-actions';
import { notFound, redirect } from 'next/navigation';

interface PostDetailPageProps {
  params: Promise<{
    post_id: string;
    board_code: string;
  }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { post_id, board_code } = await params;
  const boardInfo = await getBoardInfoUsingAdmin(board_code as 'notices' | 'qna' | 'quotes' | 'reviews');

  if (!boardInfo) {
    return notFound();
  }
  const post = await getPostUsingAdmin(post_id);

  if (!post) {
    redirect(`/admin/boards/${board_code}`);
  }

  return (
    <PostDetail post={post} boardCode={board_code as 'notices' | 'qna' | 'quotes' | 'reviews'} boardName={boardInfo.name} />
  );
}


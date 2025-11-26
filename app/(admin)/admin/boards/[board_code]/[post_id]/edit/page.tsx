import { getBoardInfoUsingAdmin } from '@/src/features/board/api/board-actions';
import PostForm from '@/src/features/post/ui/PostForm';
import { getPostUsingAdmin } from '@/src/features/post/api/post-actions';
import { notFound, redirect } from 'next/navigation';

interface PostEditPageProps {
  params: Promise<{
    post_id: string;
    board_code: string;
  }>;
}

export default async function PostEditPage({ params }: PostEditPageProps) {
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
    <PostForm
      boardCode={board_code as 'notices' | 'qna' | 'quotes' | 'reviews'}
      boardId={boardInfo.id}
      boardName={boardInfo.name}
      allowGuest={boardInfo.allow_guest}
      postId={post_id}
      data={post}
    />
  );
}


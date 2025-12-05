import { getBoardInfoUsingAdminById } from '@/src/features/board/api/board-actions';
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

  return (
    <PostForm
      boardCode={boardInfo.code}
      boardId={boardInfo.id}
      boardName={boardInfo.name}
      allowGuest={boardInfo.allow_guest}
      allowFile={boardInfo.allow_file}
      allowSecret={boardInfo.allow_secret}
      allowProductLink={boardInfo.allow_product_link}
      postId={post_id}
      data={post}
    />
  );
}


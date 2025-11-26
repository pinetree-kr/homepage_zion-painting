import { getBoardInfoUsingAdmin } from '@/src/features/board/api/board-actions';
import PostForm from '@/src/features/post/ui/PostForm';
import { notFound } from 'next/navigation';

interface NewPostPageProps {
  params: Promise<{
    board_code: string;
  }>;
}

export default async function NewPostPage({ params }: NewPostPageProps) {
  const { board_code } = await params;
  const boardInfo = await getBoardInfoUsingAdmin(board_code as 'notices' | 'qna' | 'quotes' | 'reviews');

  if (!boardInfo) {
    return notFound();
  }
  return <PostForm boardCode={board_code as 'notices' | 'qna' | 'quotes' | 'reviews'} boardId={boardInfo.id} boardName={boardInfo.name} allowGuest={boardInfo.allow_guest} />;
}


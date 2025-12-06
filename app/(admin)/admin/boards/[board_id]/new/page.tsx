import { getBoardInfoUsingAdminById, getBoardPolicies, checkBoardSupportsProductLinking } from '@/src/features/board/api/board-actions';
import PostForm from '@/src/features/post/ui/PostForm';
import { Button } from '@/src/shared/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface NewPostPageProps {
  params: Promise<{
    board_id: string;
  }>;
}

export default async function NewPostPage({ params }: NewPostPageProps) {
  const { board_id } = await params;
  const boardInfo = await getBoardInfoUsingAdminById(board_id);

  if (!boardInfo) {
    return notFound();
  }

  const boardPolicies = await getBoardPolicies(board_id);
  // 서버 사이드에서 visibility 확인: 'public'이면 비로그인 사용자도 게시글 작성 가능
  const allowGuest = boardInfo.visibility === 'public';
  // 서버 사이드에서 board_id 기반으로 제품 연결 가능 여부 확인
  const allowProductLink = await checkBoardSupportsProductLinking(board_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link passHref href={`/admin/boards/${board_id}`}>
          <Button
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
        </Link>
      </div>

      <PostForm
        boardCode={boardInfo.code}
        boardId={boardInfo.id}
        boardName={boardInfo.name}
        allowGuest={allowGuest}
        allowProductLink={allowProductLink}
        boardPolicies={boardPolicies}
      />
    </div>
  )
}


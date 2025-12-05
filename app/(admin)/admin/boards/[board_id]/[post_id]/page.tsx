import PostDetail from '@/src/features/post/ui/PostDetail';
import { getBoardInfoUsingAdminById } from '@/src/features/board/api/board-actions';
import { getPostUsingAdmin } from '@/src/features/post/api/post-actions';
import { getPostFiles } from '@/src/features/post/api/post-file-actions';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/src/shared/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PostDetailPageProps {
  params: Promise<{
    post_id: string;
    board_id: string;
  }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { post_id, board_id } = await params;
  const boardInfo = await getBoardInfoUsingAdminById(board_id);

  if (!boardInfo) {
    return notFound();
  }
  const post = await getPostUsingAdmin(post_id);

  if (!post) {
    redirect(`/admin/boards/${board_id}`);
  }

  // 첨부 파일 목록 가져오기
  const attachedFiles = await getPostFiles(post_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link passHref href={`/admin/boards/${board_id}`}>
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
        allowComment={boardInfo.allow_comment}
        attachedFiles={attachedFiles}
      />
    </div>
  );
}


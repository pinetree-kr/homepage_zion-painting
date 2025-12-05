import { getBoardInfoUsingAdminById } from '@/src/features/board/api/board-actions';
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

      <PostForm boardCode={boardInfo.code} boardId={boardInfo.id} boardName={boardInfo.name} allowGuest={boardInfo.allow_guest} allowFile={boardInfo.allow_file} allowSecret={boardInfo.allow_secret} allowProductLink={boardInfo.allow_product_link} />;
    </div>
  )
}


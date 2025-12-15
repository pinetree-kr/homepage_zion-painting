import { Button } from '@/src/shared/ui/Button';
import { LockIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import type { Board, BoardPolicy } from '@/src/entities/board/model/types';

interface PostCreateButtonProps {
  boardId: string;
  allowWrite: boolean;
}

export default async function PostCreateButton({ boardId, allowWrite }: PostCreateButtonProps) {
  if (allowWrite) {
    return (
      <Link href={`/boards/${boardId}/new`}>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          글 작성
        </Button>
      </Link>
    )
  } else {
    return (
      <div className="flex items-center gap-2">
        <Button className="gap-2" disabled>
          <LockIcon className="h-4 w-4" />
          글 작성
        </Button>
        <Link href={`/auth/sign-in`}>
          <Button className="gap-2" variant="outline">
            로그인
          </Button>
        </Link>
      </div>
    )
  }
}

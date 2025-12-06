import { getUserRole } from '@/src/entities/user/model/checkPermission';
import { Button } from '@/src/shared/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { Board, BoardPolicy } from '@/src/entities/board/model/types';

interface PostCreateButtonProps {
  boardId: string;
  boardInfo: Board;
  boardPolicies?: BoardPolicy[];
}

export default async function PostCreateButton({ boardId, boardInfo, boardPolicies = [] }: PostCreateButtonProps) {
  // 사용자의 현재 롤 확인
  const userRole = await getUserRole();

  // 사용자 롤에 따른 권한 확인
  let canCreate = false;

  if (userRole === null) {
    // 로그인하지 않은 사용자 - 게시판의 allow_guest 설정 확인
    canCreate = boardInfo.allow_guest ?? false;
  } else {
    // 로그인한 사용자 - 해당 롤의 권한 정책 확인
    const userPolicy = boardPolicies.find(p => p.role === userRole);
    canCreate = userPolicy?.post_create ?? false;
  }

  // 권한이 없으면 버튼을 표시하지 않음
  if (!canCreate) {
    return null;
  }

  return (
    <Link href={`/boards/${boardId}/new`}>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        글 작성
      </Button>
    </Link>
  );
}

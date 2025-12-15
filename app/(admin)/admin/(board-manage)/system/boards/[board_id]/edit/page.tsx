import { notFound } from 'next/navigation';
import BoardForm from '@/src/features/board/ui/BoardForm';
import { getBoardByIdUsingAdmin, getBoardPoliciesUsingAnonymous } from '@/src/features/board/api/board-actions';

interface EditBoardPageProps {
  params: Promise<{
    board_id: string;
  }>;
}

export default async function EditBoardPage({ params }: EditBoardPageProps) {
  const { board_id } = await params;
  const board = await getBoardByIdUsingAdmin(board_id);
  const boardPolicies = await getBoardPoliciesUsingAnonymous(board_id);
  if (!board) {
    notFound();
  }

  return <BoardForm board={board} boardPolicies={boardPolicies} />;
}


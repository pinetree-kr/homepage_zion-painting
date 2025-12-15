import BoardConnectionSettings from '@/src/features/board/ui/BoardConnectionSettings';
import { getBoardsUsingAdmin } from '@/src/features/board/api/board-actions';
import { getSiteSettings } from '@/src/features/post/api/post-actions';

export default async function BoardSettingsPage() {
  const [boardsResult, siteSettings] = await Promise.all([
    getBoardsUsingAdmin('', 1, 100),
    getSiteSettings(),
  ]);

  const boards = boardsResult.data;
  const defaultBoards = siteSettings?.default_boards || null;

  return (
    <BoardConnectionSettings
      boards={boards}
      defaultBoards={defaultBoards}
    />
  );
}


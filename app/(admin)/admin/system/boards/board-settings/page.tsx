import BoardConnectionSettings from '@/src/features/board/ui/BoardConnectionSettings';
import { getBoardsUsingAdmin } from '@/src/features/board/api/board-actions';
import { getProductInfo } from '@/src/features/management-product/api/product-actions';
import { getSiteSettings } from '@/src/features/post/api/post-actions';

export default async function BoardSettingsPage() {
  const [boardsResult, productInfo, siteSettings] = await Promise.all([
    getBoardsUsingAdmin('', 1, 100),
    getProductInfo(),
    getSiteSettings(),
  ]);
  
  const boards = boardsResult.data;
  const reviewBoardId = productInfo?.review_board_id || null;
  const quoteBoardId = productInfo?.quote_board_id || null;
  const noticeBoardId = siteSettings?.notice_board_id || null;
  const inquireBoardId = siteSettings?.inquire_board_id || null;
  const pdsBoardId = siteSettings?.pds_board_id || null;

  return (
    <BoardConnectionSettings 
      boards={boards}
      reviewBoardId={reviewBoardId}
      quoteBoardId={quoteBoardId}
      noticeBoardId={noticeBoardId}
      inquireBoardId={inquireBoardId}
      pdsBoardId={pdsBoardId}
    />
  );
}


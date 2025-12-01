import ProductBoardSettings from '@/src/features/management-product/ui/ProductBoardSettings';
import { getBoardsUsingAdmin } from '@/src/features/board/api/board-actions';
import { getSiteSettings } from '@/src/features/post/api/post-actions';

export default async function ProductBoardSettingsPage() {
  const [boardsResult, siteSettings] = await Promise.all([
    getBoardsUsingAdmin('', 1, 100),
    getSiteSettings(),
  ]);
  
  const boards = boardsResult.data;
  const reviewBoardId = siteSettings?.review_board_id || null;
  const inquiryBoardId = siteSettings?.inquiry_board_id || null;

  return (
    <ProductBoardSettings 
      boards={boards}
      reviewBoardId={reviewBoardId}
      inquiryBoardId={inquiryBoardId}
    />
  );
}


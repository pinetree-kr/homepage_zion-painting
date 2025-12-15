import ProductBoardSettings from '@/src/features/management-product/ui/ProductBoardSettings';
import { getBoardsUsingAdmin } from '@/src/features/board/api/board-actions';
import { getProductInfo } from '@/src/features/management-product/api/product-actions';

export default async function ProductBoardSettingsPage() {
  const [boardsResult, productInfo] = await Promise.all([
    getBoardsUsingAdmin('', 1, 100),
    getProductInfo(),
  ]);
  
  const boards = boardsResult.data;
  const reviewBoardId = productInfo?.review_board_id || null;
  const quoteBoardId = productInfo?.quote_board_id || null;

  return (
    <ProductBoardSettings 
      boards={boards}
      reviewBoardId={reviewBoardId}
      quoteBoardId={quoteBoardId}
    />
  );
}


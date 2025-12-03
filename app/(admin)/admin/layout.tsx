import AdminLayout from '@/src/features/layout/AdminLayout';
import { isAdmin } from '@/src/entities/user/model/checkPermission';
import { redirect } from 'next/navigation';
import { getSiteSettings } from '@/src/features/post/api/post-actions';
import { getProductInfo } from '@/src/features/management-product/api/product-actions';
import { getBoardsUsingAdmin } from '@/src/features/board/api/board-actions';

export const dynamic = 'force-dynamic';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!await isAdmin()) {
    redirect('/auth/sign-in');
  }

  // 게시판 연결 설정 정보 가져오기
  const [siteSettings, productInfo, boardsResult] = await Promise.all([
    getSiteSettings(),
    getProductInfo(),
    getBoardsUsingAdmin('', 1, 100),
  ]);

  const boards = boardsResult.data;
  
  // 게시판 ID로 code 매핑
  const boardIdToCode = new Map<string, string>();
  boards.forEach(board => {
    boardIdToCode.set(board.id, board.code);
  });

  // 게시판 연결 정보
  const boardConnections = {
    noticeBoardCode: siteSettings?.notice_board_id ? boardIdToCode.get(siteSettings.notice_board_id) || null : null,
    inquireBoardCode: siteSettings?.inquire_board_id ? boardIdToCode.get(siteSettings.inquire_board_id) || null : null,
    quoteBoardCode: productInfo?.quote_board_id ? boardIdToCode.get(productInfo.quote_board_id) || null : null,
    reviewBoardCode: productInfo?.review_board_id ? boardIdToCode.get(productInfo.review_board_id) || null : null,
  };

  return (
    <AdminLayout boardConnections={boardConnections}>
      {children}
    </AdminLayout>
  );
}


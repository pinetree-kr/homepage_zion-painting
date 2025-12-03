'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Board } from '@/src/entities/board/model/types';
import { saveProductInfo } from '@/src/features/management-product/api/product-actions';
import { saveSiteSettings } from '@/src/features/post/api/post-actions';
import { useRouter } from 'next/navigation';

interface BoardConnectionSettingsProps {
  boards: Board[];
  // 제품 관련 (product_info)
  reviewBoardId: string | null;
  quoteBoardId: string | null;
  // 사이트 설정 관련 (site_settings)
  noticeBoardId: string | null;
  inquireBoardId: string | null;
  pdsBoardId: string | null;
}

export default function BoardConnectionSettings({
  boards,
  reviewBoardId: initialReviewBoardId,
  quoteBoardId: initialQuoteBoardId,
  noticeBoardId: initialNoticeBoardId,
  inquireBoardId: initialInquireBoardId,
  pdsBoardId: initialPdsBoardId,
}: BoardConnectionSettingsProps) {
  const [reviewBoardId, setReviewBoardId] = useState<string>(initialReviewBoardId || '');
  const [quoteBoardId, setQuoteBoardId] = useState<string>(initialQuoteBoardId || '');
  const [noticeBoardId, setNoticeBoardId] = useState<string>(initialNoticeBoardId || '');
  const [inquireBoardId, setInquireBoardId] = useState<string>(initialInquireBoardId || '');
  const [pdsBoardId, setPdsBoardId] = useState<string>(initialPdsBoardId || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setReviewBoardId(initialReviewBoardId || '');
    setQuoteBoardId(initialQuoteBoardId || '');
    setNoticeBoardId(initialNoticeBoardId || '');
    setInquireBoardId(initialInquireBoardId || '');
    setPdsBoardId(initialPdsBoardId || '');
  }, [initialReviewBoardId, initialQuoteBoardId, initialNoticeBoardId, initialInquireBoardId, initialPdsBoardId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // 제품 정보 저장 (product_info)
      const productResult = await saveProductInfo({
        review_board_id: reviewBoardId || null,
        quote_board_id: quoteBoardId || null,
      });

      if (!productResult.success) {
        toast.error(`제품 게시판 연결 저장 중 오류가 발생했습니다: ${productResult.error || '알 수 없는 오류'}`);
        return;
      }

      // 사이트 설정 저장 (site_settings)
      const siteResult = await saveSiteSettings({
        notice_board_id: noticeBoardId || null,
        inquire_board_id: inquireBoardId || null,
        pds_board_id: pdsBoardId || null,
      });

      if (!siteResult.success) {
        toast.error(`사이트 게시판 연결 저장 중 오류가 발생했습니다: ${siteResult.error || '알 수 없는 오류'}`);
        return;
      }

      toast.success('게시판 연결 설정이 저장되었습니다.');
      router.refresh();
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    reviewBoardId !== (initialReviewBoardId || '') ||
    quoteBoardId !== (initialQuoteBoardId || '') ||
    noticeBoardId !== (initialNoticeBoardId || '') ||
    inquireBoardId !== (initialInquireBoardId || '') ||
    pdsBoardId !== (initialPdsBoardId || '');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-gray-900 text-lg font-semibold">게시판 연결 설정</h3>
          <p className="text-gray-500 text-sm mt-1">
            각 기능에 연결할 게시판을 선택하세요.
          </p>
        </div>

        <div className="border-b border-gray-200 mb-6 space-y-6">
          {/* 공지 게시판 */}
          <div className="space-y-2">
            <Label htmlFor="notice-board" className="text-gray-900 font-medium">
              공지 게시판
            </Label>
            <Select
              value={noticeBoardId}
              onValueChange={setNoticeBoardId}
            >
              <SelectTrigger id="notice-board" className="w-full">
                <SelectValue placeholder="공지사항 게시판을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">선택 안 함</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name} {board.code && `(${board.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {noticeBoardId && (
              <p className="text-sm text-gray-500">
                선택된 게시판: {boards.find(b => b.id === noticeBoardId)?.name}
              </p>
            )}
          </div>

          {/* 일반 문의 게시판 */}
          <div className="space-y-2">
            <Label htmlFor="inquire-board" className="text-gray-900 font-medium">
              일반 문의 게시판
            </Label>
            <Select
              value={inquireBoardId}
              onValueChange={setInquireBoardId}
            >
              <SelectTrigger id="inquire-board" className="w-full">
                <SelectValue placeholder="Q&A 게시판을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">선택 안 함</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name} {board.code && `(${board.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {inquireBoardId && (
              <p className="text-sm text-gray-500">
                선택된 게시판: {boards.find(b => b.id === inquireBoardId)?.name}
              </p>
            )}
          </div>

          {/* 제품 리뷰 게시판 */}
          <div className="space-y-2">
            <Label htmlFor="review-board" className="text-gray-900 font-medium">
              제품 리뷰 게시판
            </Label>
            <Select
              value={reviewBoardId}
              onValueChange={setReviewBoardId}
            >
              <SelectTrigger id="review-board" className="w-full">
                <SelectValue placeholder="고객후기 게시판을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">선택 안 함</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name} {board.code && `(${board.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reviewBoardId && (
              <p className="text-sm text-gray-500">
                선택된 게시판: {boards.find(b => b.id === reviewBoardId)?.name}
              </p>
            )}
          </div>

          {/* 제품 견적 문의 게시판 */}
          <div className="space-y-2">
            <Label htmlFor="quote-board" className="text-gray-900 font-medium">
              제품 견적 문의 게시판
            </Label>
            <Select
              value={quoteBoardId}
              onValueChange={setQuoteBoardId}
            >
              <SelectTrigger id="quote-board" className="w-full">
                <SelectValue placeholder="견적 문의 게시판을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">선택 안 함</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name} {board.code && `(${board.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {quoteBoardId && (
              <p className="text-sm text-gray-500">
                선택된 게시판: {boards.find(b => b.id === quoteBoardId)?.name}
              </p>
            )}
          </div>

          {/* 자료실 게시판 */}
          <div className="space-y-2">
            <Label htmlFor="pds-board" className="text-gray-900 font-medium">
              자료실 게시판
            </Label>
            <Select
              value={pdsBoardId}
              onValueChange={setPdsBoardId}
            >
              <SelectTrigger id="pds-board" className="w-full">
                <SelectValue placeholder="자료실 게시판을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">선택 안 함</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name} {board.code && `(${board.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pdsBoardId && (
              <p className="text-sm text-gray-500">
                선택된 게시판: {boards.find(b => b.id === pdsBoardId)?.name}
              </p>
            )}
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}


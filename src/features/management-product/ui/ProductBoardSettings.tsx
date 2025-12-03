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
import { useRouter } from 'next/navigation';

interface ProductBoardSettingsProps {
  boards: Board[];
  reviewBoardId: string | null;
  quoteBoardId: string | null;
}

export default function ProductBoardSettings({ 
  boards, 
  reviewBoardId: initialReviewBoardId,
  quoteBoardId: initialQuoteBoardId 
}: ProductBoardSettingsProps) {
  const [reviewBoardId, setReviewBoardId] = useState<string>(initialReviewBoardId || '');
  const [quoteBoardId, setQuoteBoardId] = useState<string>(initialQuoteBoardId || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setReviewBoardId(initialReviewBoardId || '');
    setQuoteBoardId(initialQuoteBoardId || '');
  }, [initialReviewBoardId, initialQuoteBoardId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const result = await saveProductInfo({
        review_board_id: reviewBoardId || null,
        quote_board_id: quoteBoardId || null,
      });

      if (!result.success) {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
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
    quoteBoardId !== (initialQuoteBoardId || '');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-gray-900 text-lg font-semibold">게시판 연결 설정</h3>
          <p className="text-gray-500 text-sm mt-1">
            제품과 연결할 <span className="font-bold text-blue-500">고객 후기</span> 게시판과 <span className="font-bold text-blue-500">견적 문의</span> 게시판을 선택하세요.
          </p>
        </div>

        <div className="space-y-6">
          {/* 리뷰게시판 선택 */}
          <div className="space-y-2">
            <Label htmlFor="review-board" className="text-gray-900 font-medium">
              고객 후기
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

          {/* 견적문의게시판 선택 */}
          <div className="space-y-2">
            <Label htmlFor="quote-board" className="text-gray-900 font-medium">
              견적 문의
            </Label>
            <Select
              value={quoteBoardId}
              onValueChange={setQuoteBoardId}
            >
              <SelectTrigger id="quote-board" className="w-full">
                <SelectValue placeholder="견적문의 게시판을 선택하세요" />
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


'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Board } from '@/src/entities/board/model/types';
import { saveSiteSettings } from '@/src/features/post/api/post-actions';
import { useRouter } from 'next/navigation';

interface ProductBoardSettingsProps {
  boards: Board[];
  reviewBoardId: string | null;
  inquiryBoardId: string | null;
}

export default function ProductBoardSettings({ 
  boards, 
  reviewBoardId: initialReviewBoardId,
  inquiryBoardId: initialInquiryBoardId 
}: ProductBoardSettingsProps) {
  const [reviewBoardId, setReviewBoardId] = useState<string>(initialReviewBoardId || '');
  const [inquiryBoardId, setInquiryBoardId] = useState<string>(initialInquiryBoardId || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setReviewBoardId(initialReviewBoardId || '');
    setInquiryBoardId(initialInquiryBoardId || '');
  }, [initialReviewBoardId, initialInquiryBoardId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const result = await saveSiteSettings({
        review_board_id: reviewBoardId || null,
        inquiry_board_id: inquiryBoardId || null,
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
    inquiryBoardId !== (initialInquiryBoardId || '');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-900 text-lg font-semibold">게시판 연결 설정</h3>
            <p className="text-gray-500 text-sm mt-1">
              제품과 연결할 리뷰게시판과 견적문의게시판을 선택하세요.
            </p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* 리뷰게시판 선택 */}
          <div className="space-y-2">
            <Label htmlFor="review-board" className="text-gray-900 font-medium">
              리뷰게시판
            </Label>
            <Select
              value={reviewBoardId}
              onValueChange={setReviewBoardId}
            >
              <SelectTrigger id="review-board" className="w-full">
                <SelectValue placeholder="리뷰게시판을 선택하세요" />
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
            <Label htmlFor="inquiry-board" className="text-gray-900 font-medium">
              견적문의게시판
            </Label>
            <Select
              value={inquiryBoardId}
              onValueChange={setInquiryBoardId}
            >
              <SelectTrigger id="inquiry-board" className="w-full">
                <SelectValue placeholder="견적문의게시판을 선택하세요" />
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
            {inquiryBoardId && (
              <p className="text-sm text-gray-500">
                선택된 게시판: {boards.find(b => b.id === inquiryBoardId)?.name}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}


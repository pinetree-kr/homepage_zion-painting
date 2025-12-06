'use client';

import { useState, useEffect, useMemo } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Board } from '@/src/entities/board/model/types';
import { saveSiteSettings } from '@/src/features/post/api/post-actions';
import type { SiteSetting } from '@/src/entities/site-setting/model/types';
import { useRouter } from 'next/navigation';

interface BoardConnectionSettingsProps {
  boards: Board[];
  defaultBoards: SiteSetting['default_boards'];
}

export default function BoardConnectionSettings({
  boards,
  defaultBoards: initialDefaultBoards,
}: BoardConnectionSettingsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // defaultBoards를 state로 관리
  const [boardStates, setBoardStates] = useState<Record<string, string>>({});

  // 초기 defaultBoards를 state로 변환
  useEffect(() => {
    if (initialDefaultBoards) {
      const states: Record<string, string> = {};
      Object.entries(initialDefaultBoards).forEach(([key, board]) => {
        states[key] = board?.id || '';
      });
      setBoardStates(states);
    }
  }, [initialDefaultBoards]);

  // 게시판 설정 목록 생성 (display_order 기준 정렬)
  const boardConfigs = useMemo(() => {
    if (!initialDefaultBoards) return [];

    return Object.entries(initialDefaultBoards)
      .map(([key, board]) => ({
        key,
        // ...BOARD_CONFIGS[key] || { label: key, placeholder: `${key} 게시판을 선택하세요` },
        label: `${board?.name || ''} 게시판`,
        placeholder: `${board?.name || ''} 게시판을 선택하세요`,
        currentBoardId: boardStates[key] || board?.id || null,
        displayOrder: board?.display_order ?? 999, // display_order가 없으면 맨 뒤로
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [initialDefaultBoards, boardStates]);

  const handleBoardChange = (key: string, boardId: string) => {
    setBoardStates((prev) => ({
      ...prev,
      [key]: boardId,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // defaultBoards 구조로 변환 (display_order 포함)
      const defaultBoardsUpdate: NonNullable<SiteSetting['default_boards']> = {};

      if (initialDefaultBoards) {
        Object.entries(initialDefaultBoards).forEach(([key, board]) => {
          const boardId = boardStates[key] || '';
          if (boardId) {
            // 선택된 게시판 정보 가져오기
            const selectedBoard = boards.find((b) => b.id === boardId);
            if (selectedBoard) {
              defaultBoardsUpdate[key] = {
                id: selectedBoard.id,
                name: selectedBoard.name || null,
                display_order: board?.display_order ?? 999,
              };
            }
          } else {
            // 연결이 해제된 경우에도 display_order는 유지
            defaultBoardsUpdate[key] = board ? {
              id: null,
              name: board.name || null,
              display_order: board.display_order ?? null,
            } : null;
          }
        });
      }

      // 사이트 설정 저장 (site_settings)
      const siteResult = await saveSiteSettings({
        default_boards: defaultBoardsUpdate,
      });

      if (!siteResult.success) {
        toast.error(`게시판 연결 저장 중 오류가 발생했습니다: ${siteResult.error || '알 수 없는 오류'}`);
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

  // 변경사항 확인
  const hasChanges = useMemo(() => {
    if (!initialDefaultBoards) return false;

    return Object.keys(initialDefaultBoards).some((key) => {
      const currentId = boardStates[key] || '';
      const initialId = initialDefaultBoards[key]?.id || '';
      return currentId !== initialId;
    });
  }, [boardStates, initialDefaultBoards]);

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
          {boardConfigs.map((config) => {
            const currentBoardId = boardStates[config.key] || '';
            return (
              <div key={config.key} className="space-y-2">
                <Label htmlFor={`board-${config.key}`} className="text-gray-900 font-medium">
                  {config.label}
                </Label>
                <Select
                  value={currentBoardId}
                  onValueChange={(value) => handleBoardChange(config.key, value)}
                >
                  <SelectTrigger id={`board-${config.key}`} className="w-full">
                    <SelectValue placeholder={config.placeholder} />
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
                {currentBoardId && (
                  <p className="text-sm text-gray-500">
                    선택된 게시판: {boards.find(b => b.id === currentBoardId)?.name}
                  </p>
                )}
              </div>
            );
          })}
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


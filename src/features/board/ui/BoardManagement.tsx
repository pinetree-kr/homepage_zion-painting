'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/src/entities/board/model/types';
import {
  Plus,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui';
import { toast } from 'sonner';
import { DataTable, DataTableColumn, DataTablePagination, DataTableSearchBar } from '@/src/shared/ui';
import { deleteBoard } from '../api/board-actions';

interface BoardManagementProps {
  items: Board[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
}

const ITEMS_PER_PAGE = 10;

export default function BoardManagement({
  items,
  totalItems,
  totalPages,
  currentPage,
  searchTerm,
}: BoardManagementProps) {
  const router = useRouter();
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const refreshPage = () => {
    router.refresh();
  };

  const handleDelete = async () => {
    if (!boardToDelete) return;

    const result = await deleteBoard(boardToDelete.id);
    if (result.success) {
      toast.success('게시판이 삭제되었습니다.');
      setBoardToDelete(null);
      refreshPage();
    } else {
      toast.error(result.error || '게시판 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const boardColumns: DataTableColumn<Board>[] = [
    {
      id: 'code',
      header: '게시판 코드',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white text-xs font-mono flex-shrink-0">
            {row.code.charAt(0).toUpperCase()}
          </div> */}
          <button
            onClick={() => router.push(`/admin/system/boards/${row.id}/edit`)}
            className="font-medium hover:text-[#1A2C6D] hover:underline text-left"
          >
            <span className="font-mono text-sm">{row.code}</span>
          </button>
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'name',
      header: '게시판 이름',
      accessor: (row) => (
        <div>
          <button
            onClick={() => router.push(`/admin/system/boards/${row.id}/edit`)}
            className="font-medium hover:text-[#1A2C6D] hover:underline text-left"
          >
            {row.name}
          </button>
          {row.description && (
            <div className="text-xs text-gray-500 mt-1">{row.description}</div>
          )}
        </div>
      ),
      sortable: true,
      width: '20%'
    },
    {
      id: 'settings',
      header: '설정',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.visibility === 'public' && (
            <Badge variant="outline" className="text-xs">공개</Badge>
          )}
          {row.visibility === 'member' && (
            <Badge variant="outline" className="text-xs">회원용</Badge>
          )}
          {row.visibility === 'owner' && (
            <Badge variant="outline" className="text-xs">1:1</Badge>
          )}
        </div>
      ),
      sortable: false,
      width: '20%'
    },
    {
      id: 'created_at',
      header: '생성일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatDate(row.created_at)}
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'actions',
      header: '',
      accessor: (row) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(`/boards/${row.id}`, '_blank')}
            className="h-8 w-8"
            title="외부 링크"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
      width: '5%'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">게시판 목록</h3>
          <Button onClick={() => router.push('/admin/system/boards/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            게시판 생성
          </Button>
        </div>

        <div className="mb-4">
          <DataTableSearchBar
            placeholder="게시판 코드, 이름, 설명으로 검색..."
            className="max-w-md"
          />
        </div>

        <DataTable
          data={items}
          columns={boardColumns}
          getRowId={(row) => row.id}
          emptyMessage="등록된 게시판이 없습니다"
          useUrlSort={true}
        />

        {totalPages > 0 && (
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </Card>

      {/* 삭제 다이얼로그 */}
      {boardToDelete && (
        <Dialog open={!!boardToDelete} onOpenChange={() => setBoardToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>게시판 삭제</DialogTitle>
              <DialogDescription>
                {boardToDelete.name} 게시판을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBoardToDelete(null)}>
                취소
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


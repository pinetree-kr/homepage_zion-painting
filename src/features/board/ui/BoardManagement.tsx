'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/src/entities/board/model/types';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Calendar,
} from 'lucide-react';
import { Card } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
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
import { DataTable, DataTableColumn, DataTableAction, DataTablePagination, DataTableSearchBar } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { createBoard, updateBoard, deleteBoard } from '../api/board-actions';

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    description: '',
    is_public: false,
    allow_anonymous: false,
    allow_comment: false,
    allow_file: false,
    allow_guest: false,
    allow_secret: false,
    display_order: 0,
    allow_product_link: false,
  });

  const refreshPage = () => {
    router.refresh();
  };

  const handleCreate = async () => {
    if (!createForm.code || !createForm.name) {
      toast.error('게시판 코드와 이름을 입력해주세요.');
      return;
    }

    // 게시판 코드는 영문, 숫자, 언더스코어만 허용
    if (!/^[a-z0-9_]+$/.test(createForm.code)) {
      toast.error('게시판 코드는 영문 소문자, 숫자, 언더스코어만 사용할 수 있습니다.');
      return;
    }

    const result = await createBoard(createForm);
    if (result.success) {
      toast.success('게시판이 생성되었습니다.');
      setCreateForm({
        code: '',
        name: '',
        description: '',
        is_public: false,
        allow_anonymous: false,
        allow_comment: false,
        allow_file: false,
        allow_guest: false,
        allow_secret: false,
        display_order: 0,
        allow_product_link: false,
      });
      setShowCreateDialog(false);
      refreshPage();
    } else {
      toast.error(result.error || '게시판 생성에 실패했습니다.');
    }
  };

  const handleEdit = async () => {
    if (!editingBoard) return;
    if (!editingBoard.code || !editingBoard.name) {
      toast.error('게시판 코드와 이름을 입력해주세요.');
      return;
    }

    // 게시판 코드는 영문, 숫자, 언더스코어만 허용
    if (!/^[a-z0-9_]+$/.test(editingBoard.code)) {
      toast.error('게시판 코드는 영문 소문자, 숫자, 언더스코어만 사용할 수 있습니다.');
      return;
    }

    const result = await updateBoard(editingBoard.id, {
      code: editingBoard.code,
      name: editingBoard.name,
      description: editingBoard.description,
      is_public: editingBoard.is_public,
      allow_anonymous: editingBoard.allow_anonymous,
      allow_comment: editingBoard.allow_comment,
      allow_file: editingBoard.allow_file,
      allow_guest: editingBoard.allow_guest,
      allow_secret: editingBoard.allow_secret,
      display_order: editingBoard.display_order,
      allow_product_link: editingBoard.allow_product_link,
    });

    if (result.success) {
      toast.success('게시판이 수정되었습니다.');
      setEditingBoard(null);
      setShowEditDialog(false);
      refreshPage();
    } else {
      toast.error(result.error || '게시판 수정에 실패했습니다.');
    }
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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const boardColumns: DataTableColumn<Board>[] = [
    {
      id: 'code',
      header: '게시판 코드',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white text-xs font-mono flex-shrink-0">
            {row.code.charAt(0).toUpperCase()}
          </div>
          <span className="font-mono text-sm">{row.code}</span>
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
          <div className="font-medium">{row.name}</div>
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
          {row.is_public && (
            <Badge variant="outline" className="text-xs">공개</Badge>
          )}
          {row.allow_anonymous && (
            <Badge variant="outline" className="text-xs">익명</Badge>
          )}
          {row.allow_comment && (
            <Badge variant="outline" className="text-xs">댓글</Badge>
          )}
          {row.allow_file && (
            <Badge variant="outline" className="text-xs">파일</Badge>
          )}
          {row.allow_guest && (
            <Badge variant="outline" className="text-xs">비회원</Badge>
          )}
          {row.allow_secret && (
            <Badge variant="outline" className="text-xs">비밀글</Badge>
          )}
        </div>
      ),
      sortable: false,
      width: '20%'
    },
    {
      id: 'product_link',
      header: '제품 연결',
      accessor: (row) => (
        <div>
          {row.allow_product_link ? (
            <Badge variant="default" className="text-xs">
              허용
            </Badge>
          ) : (
            <span className="text-xs text-gray-400">비허용</span>
          )}
        </div>
      ),
      sortable: false,
      width: '15%'
    },
    {
      id: 'display_order',
      header: '순서',
      accessor: (row) => (
        <span className="text-sm text-gray-600">{row.display_order}</span>
      ),
      sortable: true,
      width: '10%'
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
    }
  ];

  const boardActions: DataTableAction<Board>[] = [
    {
      label: '수정',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => {
        setEditingBoard({ ...row });
        setShowEditDialog(true);
      }
    },
    {
      label: '삭제',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: setBoardToDelete,
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">게시판 목록</h3>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
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
          actions={boardActions}
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

      {/* 생성 다이얼로그 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>게시판 생성</DialogTitle>
            <DialogDescription>
              새로운 게시판을 생성합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-code">게시판 코드 *</Label>
              <Input
                id="create-code"
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toLowerCase() })}
                placeholder="예: notices, qna, reviews"
              />
              <p className="text-xs text-gray-500">영문 소문자, 숫자, 언더스코어만 사용 가능합니다.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-name">게시판 이름 *</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="예: 공지사항, Q&A, 고객후기"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">게시판 설명</Label>
              <Input
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="게시판에 대한 설명을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-display-order">표시 순서</Label>
              <Input
                id="create-display-order"
                type="number"
                value={createForm.display_order}
                onChange={(e) => setCreateForm({ ...createForm, display_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-allow-product-link"
                checked={createForm.allow_product_link}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, allow_product_link: checked === true })}
              />
              <Label htmlFor="create-allow-product-link" className="cursor-pointer">
                제품 연결 허용
              </Label>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-is-public"
                  checked={createForm.is_public}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, is_public: checked === true })}
                />
                <Label htmlFor="create-is-public" className="cursor-pointer">
                  공개 게시판
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-allow-anonymous"
                  checked={createForm.allow_anonymous}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, allow_anonymous: checked === true })}
                />
                <Label htmlFor="create-allow-anonymous" className="cursor-pointer">
                  익명 게시 허용
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-allow-comment"
                  checked={createForm.allow_comment}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, allow_comment: checked === true })}
                />
                <Label htmlFor="create-allow-comment" className="cursor-pointer">
                  댓글 허용
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-allow-file"
                  checked={createForm.allow_file}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, allow_file: checked === true })}
                />
                <Label htmlFor="create-allow-file" className="cursor-pointer">
                  파일 첨부 허용
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-allow-guest"
                  checked={createForm.allow_guest}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, allow_guest: checked === true })}
                />
                <Label htmlFor="create-allow-guest" className="cursor-pointer">
                  비회원 게시 허용
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-allow-secret"
                  checked={createForm.allow_secret}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, allow_secret: checked === true })}
                />
                <Label htmlFor="create-allow-secret" className="cursor-pointer">
                  비밀글 허용
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB]">
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>게시판 수정</DialogTitle>
            <DialogDescription>
              게시판 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          {editingBoard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">게시판 코드 *</Label>
                <Input
                  id="edit-code"
                  value={editingBoard.code}
                  onChange={(e) => setEditingBoard({ ...editingBoard, code: e.target.value.toLowerCase() })}
                  placeholder="예: notices, qna, reviews"
                />
                <p className="text-xs text-gray-500">영문 소문자, 숫자, 언더스코어만 사용 가능합니다.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">게시판 이름 *</Label>
                <Input
                  id="edit-name"
                  value={editingBoard.name}
                  onChange={(e) => setEditingBoard({ ...editingBoard, name: e.target.value })}
                  placeholder="예: 공지사항, Q&A, 고객후기"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">게시판 설명</Label>
                <Input
                  id="edit-description"
                  value={editingBoard.description || ''}
                  onChange={(e) => setEditingBoard({ ...editingBoard, description: e.target.value })}
                  placeholder="게시판에 대한 설명을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-display-order">표시 순서</Label>
                <Input
                  id="edit-display-order"
                  type="number"
                  value={editingBoard.display_order}
                  onChange={(e) => setEditingBoard({ ...editingBoard, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-allow-product-link"
                  checked={editingBoard.allow_product_link}
                  onCheckedChange={(checked) => setEditingBoard({ ...editingBoard, allow_product_link: checked === true })}
                />
                <Label htmlFor="edit-allow-product-link" className="cursor-pointer">
                  제품 연결 허용
                </Label>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is-public"
                    checked={editingBoard.is_public}
                    onCheckedChange={(checked) => setEditingBoard({ ...editingBoard, is_public: checked === true })}
                  />
                  <Label htmlFor="edit-is-public" className="cursor-pointer">
                    공개 게시판
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-allow-anonymous"
                    checked={editingBoard.allow_anonymous}
                    onCheckedChange={(checked) => setEditingBoard({ ...editingBoard, allow_anonymous: checked === true })}
                  />
                  <Label htmlFor="edit-allow-anonymous" className="cursor-pointer">
                    익명 게시 허용
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-allow-comment"
                    checked={editingBoard.allow_comment}
                    onCheckedChange={(checked) => setEditingBoard({ ...editingBoard, allow_comment: checked === true })}
                  />
                  <Label htmlFor="edit-allow-comment" className="cursor-pointer">
                    댓글 허용
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-allow-file"
                    checked={editingBoard.allow_file}
                    onCheckedChange={(checked) => setEditingBoard({ ...editingBoard, allow_file: checked === true })}
                  />
                  <Label htmlFor="edit-allow-file" className="cursor-pointer">
                    파일 첨부 허용
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-allow-guest"
                    checked={editingBoard.allow_guest}
                    onCheckedChange={(checked) => setEditingBoard({ ...editingBoard, allow_guest: checked === true })}
                  />
                  <Label htmlFor="edit-allow-guest" className="cursor-pointer">
                    비회원 게시 허용
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-allow-secret"
                    checked={editingBoard.allow_secret}
                    onCheckedChange={(checked) => setEditingBoard({ ...editingBoard, allow_secret: checked === true })}
                  />
                  <Label htmlFor="edit-allow-secret" className="cursor-pointer">
                    비밀글 허용
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button onClick={handleEdit} className="bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB]">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Member } from '@/src/entities';
import {
  Shield,
  UserPlus,
  Mail,
  Trash2,
  Edit,
  Calendar,
  Key
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
import { formatDateKorean, formatDateSimple, generateUserColor, rgbToCss } from '@/src/shared/lib/utils';
import SetupForm from '@/src/features/setup/ui/SetupForm';
import { createAdminAccount, updateAdminAccount, sendPasswordResetEmail } from '../api/admin-actions';

interface AdminManagementProps {
  items: Member[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminManagement({
  items,
  totalItems,
  totalPages,
  currentPage,
  searchTerm,
}: AdminManagementProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Member | null>(null);
  const [adminToResetPassword, setAdminToResetPassword] = useState<Member | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Member | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const refreshPage = () => {
    router.refresh();
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refreshPage();
  };

  const handleEdit = async () => {
    if (!editingAdmin) return;

    if (!editingAdmin.name) {
      toast.error('이름을 입력해주세요');
      return;
    }

    setIsUpdating(true);

    try {
      // 이름 업데이트
      const result = await updateAdminAccount(
        editingAdmin.id,
        editingAdmin.name
      );

      if (!result.success) {
        toast.error(result.error || '관리자 정보 수정에 실패했습니다');
        setIsUpdating(false);
        return;
      }

      toast.success('관리자 정보가 수정되었습니다');
      setEditingAdmin(null);
      setShowEditDialog(false);
      refreshPage();
    } catch (error) {
      console.error('관리자 정보 수정 중 오류 발생:', error);
      toast.error('관리자 정보 수정 중 오류가 발생했습니다');
    }
    finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!adminToResetPassword?.email) {
      toast.error('이메일 정보가 없습니다');
      return;
    }

    setIsResettingPassword(true);

    try {
      const result = await sendPasswordResetEmail(adminToResetPassword.email);
      
      if (!result.success) {
        toast.error(result.error || '패스워드 초기화 이메일 발송에 실패했습니다');
        setIsResettingPassword(false);
        return;
      }

      toast.success('패스워드 초기화 이메일이 발송되었습니다');
      setAdminToResetPassword(null);
    } catch (error) {
      console.error('패스워드 초기화 이메일 발송 중 오류 발생:', error);
      toast.error('패스워드 초기화 이메일 발송 중 오류가 발생했습니다');
      setIsResettingPassword(false);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleDelete = () => {
    if (adminToDelete) {
      // TODO: 실제 API 호출로 변경 필요
      toast.success('관리자가 삭제되었습니다');
      setAdminToDelete(null);
      refreshPage();
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateKorean(dateString, true);
  };

  const adminColumns: DataTableColumn<Member>[] = [
    {
      id: 'name',
      header: '이름',
      accessor: (row) => {
        // 사용자 ID를 기준으로 색상 생성
        const userColor = generateUserColor(row.id);
        const backgroundColor = rgbToCss(userColor);

        return (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 border border-gray-50/80"
              style={{ backgroundColor }}
            >
              {row.name?.charAt(0)?.toUpperCase() || '-'}
            </div>
            <div className="flex items-center gap-2">
              <span>{row.name ?? '-'}</span>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                관리자
              </Badge>
            </div>
          </div>
        );
      },
      sortable: true,
      width: '25%'
    },
    {
      id: 'email',
      header: '이메일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-3 w-3" />
          {row.email}
        </div>
      ),
      sortable: true,
      width: '25%'
    },
    {
      id: 'created_at',
      header: '등록일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatDateSimple(row.created_at ?? '')}
        </div>
      ),
      sortable: true,
      width: '17.5%'
    },
    {
      id: 'last_login',
      header: '최근 접속',
      accessor: (row) => (
        <span className="text-sm text-gray-600">
          {row.last_login ? formatDate(row.last_login ?? '') : '-'}
        </span>
      ),
      sortable: true,
      width: '17.5%'
    }
  ];

  const adminActions: DataTableAction<Member>[] = [
    {
      label: '수정',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => {
        setEditingAdmin(row);
        setShowEditDialog(true);
      }
    },
    {
      label: '패스워드 초기화',
      icon: <Key className="h-4 w-4" />,
      onClick: setAdminToResetPassword,
      variant: 'default'
    },
    {
      label: '삭제',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: setAdminToDelete,
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">관리자 목록</h3>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            관리자 생성
          </Button>
        </div>

        <div className="mb-4">
          <DataTableSearchBar
            placeholder="이름, 이메일로 검색..."
            className="max-w-md"
          />
        </div>

        <DataTable
          data={items}
          columns={adminColumns}
          actions={adminActions}
          getRowId={(row) => row.id}
          emptyMessage="등록된 관리자가 없습니다"
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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>관리자 계정 생성</DialogTitle>
            <DialogDescription>
              새로운 관리자 계정을 생성합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SetupForm
              isModal={true}
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateDialog(false)}
              onCreateAccount={createAdminAccount}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 정보 수정</DialogTitle>
            <DialogDescription>
              관리자의 기본 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          {editingAdmin && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">이름</Label>
                <Input
                  id="edit-name"
                  value={editingAdmin.name ?? ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">이메일</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingAdmin.email ?? ''}
                  readOnly
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isUpdating}
            >
              {isUpdating ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {adminToResetPassword && (
        <Dialog open={!!adminToResetPassword} onOpenChange={() => setAdminToResetPassword(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>패스워드 초기화 이메일 발송</DialogTitle>
              <DialogDescription>
                {adminToResetPassword.name} 관리자에게 패스워드 초기화 링크가 포함된 이메일을 발송하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAdminToResetPassword(null)}
                disabled={isResettingPassword}
              >
                취소
              </Button>
              <Button 
                onClick={handlePasswordReset} 
                disabled={isResettingPassword}
                className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed"
              >
                {isResettingPassword ? '발송 중...' : '발송'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {adminToDelete && (
        <Dialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>관리자 삭제</DialogTitle>
              <DialogDescription>
                {adminToDelete.name} 관리자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdminToDelete(null)}>
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


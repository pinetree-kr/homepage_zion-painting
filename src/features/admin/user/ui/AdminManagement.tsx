'use client';

import { useState } from 'react';
import { Member } from '@/src/entities';
import {
  Shield,
  UserPlus,
  Mail,
  Trash2,
  Edit,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui';
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
import { DataTable, DataTableColumn, DataTableAction } from '@/src/shared/ui';

const mockAdmins: Member[] = [
  {
    id: 'admin1',
    email: 'admin@zion.com',
    name: '시온관리자',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    status: 'active',
    last_login: '2024-11-10T08:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    email_verified: false,
    phone: null,
  },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Member[]>(mockAdmins);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Member | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Member | null>(null);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    const newAdmin: Member = {
      id: `admin${Date.now()}`,
      email: inviteForm.email,
      name: inviteForm.name,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: null,
      email_verified: false,
      phone: null,
      status: 'active',
      last_login: null,
    };

    setAdmins([...admins, newAdmin]);
    setInviteForm({ name: '', email: '' });
    setShowInviteDialog(false);
    toast.success('관리자 초대장이 발송되었습니다');
  };

  const handleEdit = () => {
    if (!editingAdmin) return;

    setAdmins(admins.map(admin =>
      admin.id === editingAdmin.id ? editingAdmin : admin
    ));
    setEditingAdmin(null);
    setShowEditDialog(false);
    toast.success('관리자 정보가 수정되었습니다');
  };

  const handleDelete = () => {
    if (adminToDelete) {
      setAdmins(admins.filter(a => a.id !== adminToDelete.id));
      toast.success('관리자가 삭제되었습니다');
      setAdminToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const adminColumns: DataTableColumn<Member>[] = [
    {
      id: 'name',
      header: '이름',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white text-sm flex-shrink-0">
            {row.name?.charAt(0)}
          </div>
          <div className="flex items-center gap-2">
            <span>{row.name ?? '-'}</span>
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              관리자
            </Badge>
          </div>
        </div>
      ),
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
      id: 'status',
      header: '상태',
      accessor: (row) => (
        <Badge variant={row.status === 'active' ? 'default' : 'secondary'} className="text-xs">
          {row.status === 'active' ? '활성' : '비활성'}
        </Badge>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'created_at',
      header: '등록일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatDate(row.created_at ?? '')}
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
      label: '삭제',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: setAdminToDelete,
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 text-2xl font-semibold mb-2">관리자 관리</h1>
          <p className="text-gray-500 text-sm">시스템 관리자를 추가, 수정, 삭제합니다</p>
        </div>
        <Button
          onClick={() => setShowInviteDialog(true)}
          className="bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] hover:opacity-90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          관리자 초대
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">전체 관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#1A2C6D]" />
              <span className="text-2xl">{admins.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">활성 관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-2xl">{admins.filter(a => a.status === 'active').length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">비활성 관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <span className="text-2xl">{admins.filter(a => a.status === 'inactive').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>관리자 목록</CardTitle>
          <CardDescription>
            현재 등록된 모든 관리자 계정입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={admins}
            columns={adminColumns}
            actions={adminActions}
            getRowId={(row) => row.id}
            emptyMessage="등록된 관리자가 없습니다"
          />
        </CardContent>
      </Card>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 초대</DialogTitle>
            <DialogDescription>
              새로운 관리자를 초대합니다. 초대 이메일이 발송됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">이름</Label>
              <Input
                id="invite-name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="관리자 이름"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">이메일</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              취소
            </Button>
            <Button onClick={handleInvite} className="bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB]">
              초대장 발송
            </Button>
          </DialogFooter>
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
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                />
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


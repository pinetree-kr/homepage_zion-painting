import { useState } from 'react';
import { Member } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  UserX, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { DataTable, DataTableColumn, DataTableAction } from '../ui/data-table';

// Mock data
const mockMembers: Member[] = [
  {
    id: '1',
    email: 'user1@example.com',
    name: '김철수',
    role: 'user',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active',
    lastLogin: '2024-11-09T15:30:00Z',
    phone: '010-1234-5678'
  },
  {
    id: '2',
    email: 'user2@example.com',
    name: '이영희',
    role: 'user',
    createdAt: '2024-02-20T14:20:00Z',
    status: 'active',
    lastLogin: '2024-11-08T09:15:00Z',
    phone: '010-2345-6789'
  },
  {
    id: '3',
    email: 'user3@example.com',
    name: '박민수',
    role: 'user',
    createdAt: '2024-03-10T08:45:00Z',
    status: 'inactive',
    lastLogin: '2024-10-15T11:20:00Z',
    phone: '010-3456-7890'
  },
];

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleToggleStatus = (memberId: string) => {
    setMembers(members.map(member => 
      member.id === memberId 
        ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
        : member
    ));
    toast.success('회원 상태가 변경되었습니다');
  };

  const handleDeleteMember = () => {
    if (memberToDelete) {
      setMembers(members.filter(m => m.id !== memberToDelete.id));
      toast.success('회원이 삭제되었습니다');
      setMemberToDelete(null);
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

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    admins: members.filter(m => m.role === 'admin').length,
  };

  const memberColumns: DataTableColumn<Member>[] = [
    {
      id: 'name',
      header: '이름',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white text-sm flex-shrink-0">
            {row.name.charAt(0)}
          </div>
          <span>{row.name}</span>
        </div>
      ),
      sortable: true,
      width: '15%'
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
      width: '20%'
    },
    {
      id: 'phone',
      header: '연락처',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3 w-3" />
          {row.phone || '-'}
        </div>
      ),
      width: '15%'
    },
    {
      id: 'role',
      header: '역할',
      accessor: (row) => (
        <Badge variant={row.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
          {row.role === 'admin' ? (
            <><Shield className="h-3 w-3 mr-1" />관리자</>
          ) : (
            <><UserIcon className="h-3 w-3 mr-1" />사용자</>
          )}
        </Badge>
      ),
      sortable: true,
      width: '10%'
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
      width: '10%'
    },
    {
      id: 'createdAt',
      header: '가입일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatDate(row.createdAt)}
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'lastLogin',
      header: '최근 접속',
      accessor: (row) => (
        <span className="text-sm text-gray-600">
          {row.lastLogin ? formatDate(row.lastLogin) : '-'}
        </span>
      ),
      sortable: true,
      width: '15%'
    }
  ];

  const memberActions: DataTableAction<Member>[] = [
    {
      label: (member: Member) => member.status === 'active' ? '비활성화' : '활성화',
      icon: (member: Member) => member.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
      onClick: (row) => handleToggleStatus(row.id)
    },
    {
      label: '삭제',
      icon: <UserX className="h-4 w-4" />,
      onClick: setMemberToDelete,
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">회원 관리</h1>
        <p className="text-muted-foreground">
          등록된 회원을 조회하고 관리합니다
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">전체 회원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">활성 회원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-2xl">{stats.active}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">비활성 회원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-orange-600" />
              <span className="text-2xl">{stats.inactive}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#1A2C6D]" />
              <span className="text-2xl">{stats.admins}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
          <CardDescription>
            필터와 검색을 사용하여 회원을 찾을 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="역할" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="user">사용자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <DataTable
            data={filteredMembers}
            columns={memberColumns}
            actions={memberActions}
            getRowId={(row) => row.id}
            emptyMessage="검색 결과가 없습니다"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDelete?.name} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

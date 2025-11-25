'use client';

import { useRouter } from 'next/navigation';
import { Mail, Phone, Calendar, User as UserIcon } from 'lucide-react';
import { Card } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Profile } from '@/src/entities';
import { DataTable, DataTableColumn, DataTableSearchBar, DataTablePagination } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import {
  deleteUser,
} from '../api/user-actions';
import Link from 'next/link';

interface MembersProps {
  items: Profile[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
}

const ITEMS_PER_PAGE = 10;

export default function Members({
  items,
  totalItems,
  totalPages,
  currentPage,
  searchTerm
}: MembersProps) {
  const router = useRouter();

  const removeUser = async (id: string) => {
    if (!confirm('이 회원을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteUser(id);
      if (result.success) {
        toast.success('회원이 삭제되었습니다.');
        
        router.refresh();
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const memberColumns: DataTableColumn<Profile>[] = [
    {
      id: 'name',
      header: '이름',
      accessor: (row) => {
        return (
          <Link href={`/admin/customer/members/${row.id}`} className="text-blue-500 hover:text-blue-700 font-medium">
            {row.name || '-'}
          </Link>
        );
      },
      width: '20%'
    },
    {
      id: 'email',
      header: '이메일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-3.5 w-3.5 text-gray-400" />
          {row.email || '-'}
        </div>
      ),
      sortable: true,
      width: '25%',
    },
    {
      id: 'phone',
      header: '전화번호',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5 text-gray-400" />
          {row.phone || '-'}
        </div>
      ),
      width: '20%'
    },
    {
      id: 'last_login',
      header: '최근 로그인',
      accessor: (row) => {
        if (!row.last_login) return '-';
        const date = new Date(row.last_login);
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            {date.toLocaleDateString('ko-KR')}
          </div>
        );
      },
      sortable: true,
      width: '15%'
    },
    {
      id: 'created_at',
      header: '가입일',
      accessor: (row) => {
        if (!row.created_at) return '-';
        const date = new Date(row.created_at);
        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString('ko-KR')}
          </div>
        );
      },
      sortable: true,
      width: '15%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 회원 관리 섹션 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">회원 목록</h3>
        </div>

        <div className="mb-4">
          <DataTableSearchBar
            placeholder="이름, 이메일, 전화번호로 검색..."
            className="max-w-md"
          />
        </div>

        <DataTable
          data={items}
          columns={memberColumns}
          getRowId={(row) => row.id}
          emptyMessage="등록된 회원이 없습니다"
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
    </div>
  );
}


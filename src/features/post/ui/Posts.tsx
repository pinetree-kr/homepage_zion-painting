'use client';

import { useRouter } from 'next/navigation';
import { Plus, Calendar, User as UserIcon, Eye, MessageSquare, ThumbsUp, Pin, Image as ImageIcon, Settings } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { DataTable, DataTableColumn, DataTableSearchBar, DataTablePagination } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import { Post } from '@/src/entities/post/model/types';
import Link from 'next/link';
import { formatDateSimple } from '@/src/shared/lib/utils';

interface PostsProps {
  boardId: string;
  boardName: string;
  items: Post[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  isAdmin?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function Posts({
  boardId,
  boardName,
  items,
  totalItems,
  totalPages,
  currentPage,
  searchTerm,
  isAdmin = false
}: PostsProps) {
  const router = useRouter();

  const handleAdd = () => {
    const newPath = `/admin/boards/${boardId}/new`;
    router.push(newPath);
  };

  const handleEditBoard = () => {
    const editPath = `/admin/system/boards/${boardId}/edit`;
    router.push(editPath);
  };

  const postColumns: DataTableColumn<Post>[] = [
    {
      id: 'title',
      header: '제목',
      accessor: (row) => {
        return (
          <div className="flex items-center gap-2">
            {row.content_metadata?.thumbnail_url && (
              <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            {row.is_pinned && (
              <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            )}
            <Link
              href={`/admin/boards/${boardId}/${row.id}`}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              {row.title}
            </Link>
          </div>
        );
      },
      sortable: true,
      width: '35%'
    },
    {
      id: 'author',
      header: '작성자',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UserIcon className="h-3.5 w-3.5 text-gray-400" />
          {row.author_metadata?.name || '-'}
          {!row.author_id && row.author_metadata?.name && (<span className="text-gray-500/50 ml-1">(탈퇴한 회원)</span>)}
        </div>
      ),
      sortable: true,
      width: '15%',
    },
    {
      id: 'status',
      header: '상태',
      accessor: (row) => (
        <Badge variant={row.status === 'published' ? 'default' : 'secondary'}>
          {row.status === 'published' ? '게시됨' : '임시저장'}
        </Badge>
      ),
      sortable: true,
      width: '10%'
    },
    {
      id: 'stats',
      header: '통계',
      accessor: (row) => (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-gray-400" />
            <span>{row.view_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5 text-gray-400" />
            <span>{row.like_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
            <span>{row.comment_count}</span>
          </div>
        </div>
      ),
      width: '20%'
    },
    {
      id: 'created_at',
      header: '작성일',
      accessor: (row) => {
        if (!row.created_at) return '-';
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            {formatDateSimple(row.created_at)}
          </div>
        );
      },
      sortable: true,
      width: '15%'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">{boardName}</h3>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditBoard}
                className="h-8 w-8"
                title="게시판 설정"
              >
                <Settings className="h-4 w-4 text-gray-600 hover:text-gray-900" />
              </Button>
            )}
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            작성
          </Button>
        </div>

        <div className="mb-4">
          <DataTableSearchBar
            placeholder="제목, 내용으로 검색..."
            className="max-w-md"
          />
        </div>

        <DataTable
          data={items}
          columns={postColumns}
          getRowId={(row) => row.id}
          emptyMessage="등록된 게시글이 없습니다"
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
    </div>
  );
}


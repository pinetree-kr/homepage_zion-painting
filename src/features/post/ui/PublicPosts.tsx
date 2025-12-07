'use client';

import { Calendar, User as UserIcon, Eye, MessageSquare, ThumbsUp, Pin, Image as ImageIcon, Loader2, LogIn } from 'lucide-react';
import { Button, Card } from '@/src/shared/ui';
import { DataTable, DataTableColumn, DataTableSearchBar, DataTablePagination } from '@/src/shared/ui';
import { Post } from '@/src/entities/post/model/types';
import Link from 'next/link';
import { BoardPolicy } from '@/src/entities/board/model/types';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatDateSimple } from '@/src/shared/lib/utils';

interface PublicPostsProps {
  boardId: string;
  boardName: string;
  items: Post[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  createButton?: React.ReactNode;
}

const ITEMS_PER_PAGE = 10;

export default function PublicPosts({
  boardId,
  boardName,
  items,
  totalItems,
  totalPages,
  currentPage,
  searchTerm,
  createButton,
}: PublicPostsProps) {
  const postColumns: DataTableColumn<Post>[] = [
    {
      id: 'title',
      header: '제목',
      accessor: (row) => {
        return (
          <div className="flex items-center gap-2">
            {row.thumbnail_url && (
              <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            {row.is_pinned && (
              <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            )}
            <Link
              href={`/boards/${boardId}/${row.id}`}
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
          {row.author_name || '-'}
        </div>
      ),
      sortable: true,
      width: '15%',
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
          <h3 className="text-gray-900 text-lg font-semibold">{boardName}</h3>
          {createButton}
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

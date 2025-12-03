'use client';

import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Tag, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Product, ProductCategory } from '@/src/entities';
import { DataTable, DataTableColumn, DataTableSearchBar, DataTablePagination } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import {
  deleteProduct,
} from '../api/product-actions';
import Link from 'next/link';

interface ProductsProps {
  categories: ProductCategory[];
  items: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
}

const ITEMS_PER_PAGE = 10;

export default function Products({
  categories,
  items,
  totalItems,
  totalPages,
  currentPage,
  searchTerm
}: ProductsProps) {
  const router = useRouter();

  const addProduct = () => {
    router.push('/admin/sections/product/list/new');
  };

  const editProduct = (product: Product & { category?: ProductCategory | null }) => {
    router.push(`/admin/sections/product/list/${product.id}`);
  };

  const removeProduct = async (id: string) => {
    if (!confirm('이 제품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteProduct(id);
      if (result.success) {
        toast.success('제품이 삭제되었습니다.');
        
        router.refresh();
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  // categories를 맵으로 변환하여 빠른 조회 가능하도록
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  const productColumns: DataTableColumn<Product & { category?: ProductCategory | null }>[] = [
    {
      id: 'title',
      header: '제목',
      accessor: (row) => {
        return (
          <div className="flex items-center gap-2">
            {row.thumbnail_url && (
              <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            <Link href={`/admin/sections/product/list/${row.id}`} className="text-blue-500 hover:text-blue-700">
              {row.title}
            </Link>
          </div>
        );
      },
      sortable: true,
      width: '25%'
    },
    {
      id: 'category',
      header: '카테고리',
      accessor: (row) => (
        <Badge variant="outline" className="text-xs">
          <Tag className="h-3 w-3 mr-1" />
          {row.category_id ? (categoryMap.get(row.category_id)?.title || '미분류') : '미분류'}
        </Badge>
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
      id: 'content',
      header: '내용',
      accessor: (row) => {
        // DB에 저장된 content_summary 사용, 없으면 content에서 추출
        let displayText = row.content_summary || row.content;
        // UI에서는 30자로 제한하고 "..." 추가
        if (displayText && displayText.length > 30) {
          displayText = displayText.substring(0, 30) + '...';
        }
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600 max-w-md">
            {/* {row.thumbnail_url && (
              <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )} */}
            <span>{displayText}</span>
          </div>
        );
      },
      width: '30%'
    },
    {
      id: 'created_at',
      header: '등록일',
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
      width: '20%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 제품 관리 섹션 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 text-lg font-semibold">제품 목록</h3>
          <Button onClick={addProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            제품 추가
          </Button>
        </div>

        <div className="mb-4">
          <DataTableSearchBar
            placeholder="제품명, 내용으로 검색..."
            className="max-w-md"
          />
        </div>

        <DataTable
          data={items.map(product => ({
            ...product,
            category: product.category_id ? categoryMap.get(product.category_id) || null : null,
          }))}
          columns={productColumns}
          getRowId={(row) => row.id}
          emptyMessage="등록된 제품이 없습니다"
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


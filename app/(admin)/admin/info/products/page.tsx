import Products from '@/src/features/management-product/ui/Products';
import { searchProductsUsingAdmin, getProductCategories } from '@/src/features/management-product/api/product-actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const searchParamsData = await searchParams;
  const searchTerm = searchParamsData?.search || '';
  const page = parseInt(searchParamsData?.page || '1', 10);
  const sortColumn = searchParamsData?.sort || null;
  const sortDirection = (searchParamsData?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
  
  const [result, categories] = await Promise.all([
    searchProductsUsingAdmin(searchTerm, page, ITEMS_PER_PAGE, sortColumn, sortDirection),
    getProductCategories(),
  ]);
  
  return (
    <Products 
      categories={categories} 
      items={result.data}
      totalItems={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      searchTerm={searchTerm}
    />
  );
}


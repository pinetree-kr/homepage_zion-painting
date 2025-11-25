import Products from '@/src/features/management-product/ui/Products';
import { searchProductsUsingAdmin, getProductCategories } from '@/src/features/management-product/api/product-actions';

interface ManagementProductsPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 10;

export default async function ManagementProductsPage({ searchParams }: ManagementProductsPageProps) {
  const searchTerm = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  
  const [result, categories] = await Promise.all([
    searchProductsUsingAdmin(searchTerm, page, ITEMS_PER_PAGE),
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


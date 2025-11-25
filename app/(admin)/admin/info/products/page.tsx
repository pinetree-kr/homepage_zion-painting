import ManagementProductsPage from '@/src/pages/management-products';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ManagementProductsPage searchParams={searchParams} />;
}


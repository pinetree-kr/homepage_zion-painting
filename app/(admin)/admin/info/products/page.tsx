import ManagementProductsPage from '@/src/pages/management-products';

interface ProductsPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ManagementProductsPage searchParams={searchParams} />;
}


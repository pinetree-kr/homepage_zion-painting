import ProductForm from '@/src/features/management-product/ui/ProductForm';
import {
  getProductCategories,
  getProductUsingAdmin,
} from '@/src/features/management-product/api/product-actions';
import { redirect } from 'next/navigation';

interface ProductEditPageProps {
  params: Promise<{
    product_id: string;
  }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { product_id } = await params;
  const [categories, product] = await Promise.all([
    getProductCategories(),
    getProductUsingAdmin(product_id),
  ]);

  if (!product) {
    redirect('/admin/sections/products');
  }

  return (
    <ProductForm
      productId={product_id}
      categories={categories}
      data={product}
    />
  );
}


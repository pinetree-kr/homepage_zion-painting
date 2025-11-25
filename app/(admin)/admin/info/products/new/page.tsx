import ProductForm from '@/src/features/management-product/ui/ProductForm';
import { getProductCategories } from '@/src/features/management-product/api/product-actions';

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return <ProductForm categories={categories} />;
}


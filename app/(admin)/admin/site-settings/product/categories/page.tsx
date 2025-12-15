import ProductCategories from '@/src/features/management-product/ui/ProductCategories';
import { getProductCategories } from '@/src/features/management-product/api/product-actions';

export default async function ProductCategoriesPage() {
  const productCategories = await getProductCategories();
  return <ProductCategories items={productCategories} />;
}

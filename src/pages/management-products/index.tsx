import Products from '@/src/features/management-product/ui/Products';
import { getProductsUsingAdmin, getProductCategories } from '@/src/features/management-product/api/product-actions';

export default async function ManagementProductsPage() {
  const [products, categories] = await Promise.all([
    getProductsUsingAdmin(),
    getProductCategories(),
  ]);
  
  return <Products categories={categories} items={products} />;
}


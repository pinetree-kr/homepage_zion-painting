import Products from '@/src/features/home/ui/Products';
import { getProductsUsingAnonymous, getProductCategories } from '@/src/features/management-product/api/product-actions';

export default async function ProductsPage() {
    const [products, categories] = await Promise.all([
        getProductsUsingAnonymous(),
        getProductCategories(),
    ]);

    return (
        <div className="relative bg-[#F4F6F8] min-h-screen">
            <div className="pt-20 md:pt-24">
                <Products products={products} categories={categories} />
            </div>
        </div>
    );
}


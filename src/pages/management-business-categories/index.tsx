import BusinessCategories from '@/src/features/management-business/ui/BusinessCategories';
import { getBusinessCategories } from '@/src/features/management-business/api/business-actions';

export default async function ManagementBusinessCategoriesPage() {
  const businessCategories = await getBusinessCategories();
  return <BusinessCategories items={businessCategories} />;
}


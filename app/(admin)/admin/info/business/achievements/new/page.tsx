import BusinessAchievementForm from '@/src/features/management-business/ui/BusinessAchievementForm';
import { getBusinessCategories } from '@/src/features/management-business/api/business-actions';

export default async function NewBusinessAchievementPage() {
  const categories = await getBusinessCategories();

  return <BusinessAchievementForm categories={categories} />;
}


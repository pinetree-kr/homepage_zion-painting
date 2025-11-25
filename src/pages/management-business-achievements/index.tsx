import BusinessAchievements from '@/src/features/management-business/ui/BusinessAchievements';
import {
  getBusinessCategories,
  getBusinessAchievementsUsingAdmin,
} from '@/src/features/management-business/api/business-actions';

export default async function BusinessAchievementsPage() {
  const [categories, achievements] = await Promise.all([
    getBusinessCategories(),
    getBusinessAchievementsUsingAdmin(),
  ]);

  return (
    <BusinessAchievements
      categories={categories}
      items={achievements}
    />
  );
}


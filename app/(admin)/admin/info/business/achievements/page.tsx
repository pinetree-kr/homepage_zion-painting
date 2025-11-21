import BusinessAchievements from '@/src/features/management-business/ui/BusinessAchievements';
import {
  getBusinessCategories,
  getBusinessAchievements,
} from '@/src/features/management-business/api/business-actions';

export default async function BusinessAchievementsPage() {
  const [categories, achievements] = await Promise.all([
    getBusinessCategories(),
    getBusinessAchievements(),
  ]);

  return (
    <BusinessAchievements
      categories={categories}
      items={achievements}
    />
  );
}


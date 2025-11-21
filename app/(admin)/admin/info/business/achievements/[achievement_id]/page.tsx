import BusinessAchievementForm from '@/src/features/management-business/ui/BusinessAchievementForm';
import {
  getBusinessCategories,
  getBusinessAchievements,
} from '@/src/features/management-business/api/business-actions';
import { redirect } from 'next/navigation';

interface BusinessAchievementEditPageProps {
  params: {
    achievement_id: string;
  };
}

export default async function BusinessAchievementEditPage({ params }: BusinessAchievementEditPageProps) {
  const [categories, achievements] = await Promise.all([
    getBusinessCategories(),
    getBusinessAchievements(),
  ]);

  const achievement = achievements.find(a => a.id === params.achievement_id);

  if (!achievement) {
    redirect('/admin/info/business/achievements');
  }

  return (
    <BusinessAchievementForm
      achievementId={params.achievement_id}
      categories={categories}
      data={achievement}
    />
  );
}


import BusinessAchievements from '@/src/pages/management-business-achievements';

interface BusinessAchievementsPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

export default function BusinessAchievementsPage({ searchParams }: BusinessAchievementsPageProps) {
  return <BusinessAchievements searchParams={searchParams} />;
}
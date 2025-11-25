import BusinessAchievements from '@/src/pages/management-business-achievements';

interface BusinessAchievementsPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function BusinessAchievementsPage({ searchParams }: BusinessAchievementsPageProps) {
  return <BusinessAchievements searchParams={searchParams} />;
}
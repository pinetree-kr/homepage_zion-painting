import ManagementBoardPage from '@/src/pages/management-posts';

interface BoardPageProps {
  params: Promise<{
    board_code: string;
  }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  return <ManagementBoardPage params={params} searchParams={searchParams} />;
}


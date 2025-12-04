import { LogManagement } from '@/src/features/admin/system';
import { 
  getActivityLogsUsingAdmin, 
  getActivityLogStatsUsingAdmin, 
  getTotalActivityLogCountUsingAdmin 
} from '@/src/entities/system/model/api';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5분 TTL

interface LogsPageProps {
  searchParams: Promise<{
    search?: string;
    logType?: string;
    dateFilter?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 50;

export default async function ManagementSystemLogsPage({ searchParams }: LogsPageProps) {
  const searchParamsData = await searchParams;
  const searchQuery = searchParamsData?.search || '';
  const logTypeFilter = searchParamsData?.logType || 'all';
  const dateFilter = searchParamsData?.dateFilter || 'all';
  const page = parseInt(searchParamsData?.page || '1', 10);

  // 데이터 병렬 로드
  const [logsResult, stats, totalCount] = await Promise.all([
    getActivityLogsUsingAdmin(searchQuery, logTypeFilter, dateFilter, page, ITEMS_PER_PAGE),
    getActivityLogStatsUsingAdmin(),
    getTotalActivityLogCountUsingAdmin(),
  ]);

  return (
    <LogManagement
      initialLogs={logsResult.data}
      totalCount={logsResult.total}
      stats={stats}
      totalLogCount={totalCount}
      searchQuery={searchQuery}
      logTypeFilter={logTypeFilter}
      dateFilter={dateFilter}
      currentPage={page}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  );
}


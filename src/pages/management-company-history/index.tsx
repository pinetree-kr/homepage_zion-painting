import CompanyHistories from '@/src/features/management-company/ui/CompanyHistories';
import { getCompanyHistories } from '@/src/features/management-company/api/company-actions';

export const dynamic = 'force-dynamic';

export default async function ManagementCompanyHistoryPage() {
  const histories = await getCompanyHistories();

  return <CompanyHistories items={histories} />;
}


import { CompanyHistories, getCompanyHistories } from '@/src/features/management-company';

export default async function ManagementCompanyHistoryPage() {
  const histories = await getCompanyHistories();

  return <CompanyHistories items={histories} />;
}


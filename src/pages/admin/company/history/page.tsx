import { HistoryTab, getCompanyHistory } from '@/src/features/admin/company';

export default async function CompanyHistoryPage() {
  const history = await getCompanyHistory();

  return <HistoryTab initialHistory={history} />;
}


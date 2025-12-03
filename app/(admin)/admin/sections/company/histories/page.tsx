"use server"

import CompanyHistories from '@/src/features/management-company/ui/CompanyHistories';
import { getCompanyHistories } from '@/src/features/management-company/api/company-actions';

export default async function ManagementCompanyHistoriesPage() {
  const histories = await getCompanyHistories();

  return <CompanyHistories items={histories} />;
}


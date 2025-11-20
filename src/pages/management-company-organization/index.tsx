import CompanyOrganization from '@/src/features/management-company/ui/CompanyOrganization';
import { getCompanyOrganizationMembers } from '@/src/features/management-company/api/company-actions';

export const dynamic = 'force-dynamic';

export default async function ManagementCompanyOrganizationPage() {
  const members = await getCompanyOrganizationMembers();
  return <CompanyOrganization items={members} />;
}


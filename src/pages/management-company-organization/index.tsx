import CompanyOrganization from '@/src/features/management-company/ui/CompanyOrganization';
import { getCompanyOrganizationMembers } from '@/src/features/management-company/api/company-actions';

export default async function ManagementCompanyOrganizationPage() {
  const members = await getCompanyOrganizationMembers();
  return <CompanyOrganization items={members} />;
}


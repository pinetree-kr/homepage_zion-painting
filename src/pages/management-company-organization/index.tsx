import { CompanyOrganization, getCompanyOrganizationMembers } from '@/src/features/management-company';

export default async function ManagementCompanyOrganizationPage() {
  const members = await getCompanyOrganizationMembers();
  return <CompanyOrganization items={members} />;
}


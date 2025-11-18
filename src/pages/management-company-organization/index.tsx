import { CompanyOrganization, getCompanyInfo } from '@/src/features/management-company';

export default async function ManagementCompanyOrganizationPage() {
  const companyInfo = await getCompanyInfo();

  return <CompanyOrganization initialContent={companyInfo?.organizationContent || ''} />;
}


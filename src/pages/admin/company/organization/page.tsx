import { OrganizationTab, getCompanyInfo } from '@/src/features/admin/company';

export default async function CompanyOrganizationPage() {
  const companyInfo = await getCompanyInfo();

  return <OrganizationTab initialContent={companyInfo?.organizationContent || ''} />;
}


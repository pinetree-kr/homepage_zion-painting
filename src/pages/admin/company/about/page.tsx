import { AboutTab, getCompanyInfo } from '@/src/features/admin/company';

export default async function CompanyAboutPage() {
  const companyInfo = await getCompanyInfo();

  return <AboutTab initialContent={companyInfo?.aboutContent || ''} />;
}


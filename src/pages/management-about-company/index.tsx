import { AboutCompany, getCompanyInfo } from '@/src/features/management-company';

export default async function ManangementAboutCompanyPage() {
  const companyInfo = await getCompanyInfo();

  return <AboutCompany item={companyInfo?.aboutContent || ''} />;
}


import AboutCompany from '@/src/features/management-company/ui/AboutCompany';
import { getCompanyAboutInfo } from '@/src/features/management-company/api/company-actions';

export const dynamic = 'force-dynamic';

export default async function ManangementAboutCompanyPage() {
  const aboutInfo = await getCompanyAboutInfo();

  return <AboutCompany data={aboutInfo || {
    introduction: '',
    strengths: [],
    vision: '',
    values: [],
    greetings: '',
    mission: '',
  }} />;
}


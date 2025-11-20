import { AboutCompany, getCompanyAboutInfo } from '@/src/features/management-company';

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


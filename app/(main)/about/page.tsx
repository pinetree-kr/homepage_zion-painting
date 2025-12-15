import CompanyAboutHero from '@/src/features/company-about/ui/CompanyAboutHero';
import CompanyAboutNavigation from '@/src/features/company-about/ui/CompanyAboutNavigation';
import CompanyAboutSections from '@/src/features/company-about/ui/CompanyAboutSections';
import {
    getCompanyAboutInfo,
    getCompanyHistories,
    getCompanyOrganizationMembers,
    getContactInfo,
} from '@/src/features/management-company/api/company-actions';

export default async function AboutPage() {
    const [aboutInfo, histories, organizationMembers, contactInfo] = await Promise.all([
        getCompanyAboutInfo(),
        getCompanyHistories(),
        getCompanyOrganizationMembers(),
        getContactInfo(),
    ]);

    return (
        <div className="relative bg-white min-h-screen">
            <CompanyAboutHero
                title="회사소개"
                description={aboutInfo?.introduction ? undefined : "도장설비 전문기업으로서 최고 품질의 제품과 서비스로 고객만족을 실현합니다"}
            />
            <CompanyAboutNavigation 
                hasIntroduction={!!aboutInfo?.introduction} 
                hasGreetings={!!aboutInfo?.greetings} 
            />
            <CompanyAboutSections
                aboutInfo={aboutInfo}
                histories={histories}
                organizationMembers={organizationMembers}
                contactInfo={contactInfo}
            />
        </div>
    );
}


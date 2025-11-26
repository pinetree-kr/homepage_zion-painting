import About from '@/src/features/home/ui/About';
import { getCompanyAboutInfo } from '@/src/features/management-company/api/company-actions';

export default async function AboutPage() {
    const aboutInfo = await getCompanyAboutInfo();

    return (
        <div className="relative bg-[#F4F6F8] min-h-screen">
            <div className="pt-20 md:pt-24">
                <About aboutInfo={aboutInfo} />
            </div>
        </div>
    );
}


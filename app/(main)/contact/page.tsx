import Contact from '@/src/features/home/ui/Contact';
import { getContactInfo } from '@/src/features/management-company/api/company-actions';

export default async function ContactPage() {
    const contactInfo = await getContactInfo();
    
    return (
        <div className="relative bg-[#F4F6F8] min-h-screen">
            <div className="pt-20 md:pt-24">
                <Contact contactInfo={contactInfo} />
            </div>
        </div>
    );
}


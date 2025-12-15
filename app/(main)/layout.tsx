import Header from '@/src/features/home/ui/Header';
import Footer from '@/src/features/home/ui/Footer';
import { getContactInfo } from '@/src/features/management-company/api/company-actions';
import { getSiteSettings } from '@/src/features/post/api/post-actions';
import 'ckeditor5/ckeditor5-content.css'
// import 'ckeditor5/ckeditor5.css';

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [contactInfo, siteSettings] = await Promise.all([
        getContactInfo(),
        getSiteSettings(),
    ]);

    return (
        <>
            <Header enableScrollAnimation={false} />
            {children}
            <Footer contactInfo={contactInfo} defaultBoards={siteSettings?.default_boards || null} />
        </>
    );
}


import { Header, Hero, About, Business, Products, Contact, Footer } from '@/src/features/home';
import { getCompanyAboutInfo } from '@/src/features/management-company/api/company-actions';

export default async function HomePage() {
    const aboutInfo = await getCompanyAboutInfo();
    return (
        <main>
            <div className="relative bg-[#F4F6F8]">
                <Header />
                <Hero />
            </div>
            <About aboutInfo={aboutInfo} />
            <Business />
            <Products />
            <Contact />
            <Footer />
        </main>
    );
}


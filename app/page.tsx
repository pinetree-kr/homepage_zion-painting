import Header from '@/src/features/home/ui/Header';
import Hero from '@/src/features/prologue/ui/Hero';
import About from '@/src/features/home/ui/About';
import Business from '@/src/features/home/ui/Business';
import Products from '@/src/features/home/ui/Products';
import Contact from '@/src/features/home/ui/Contact';
import Footer from '@/src/features/home/ui/Footer';
import { getCompanyAboutInfo } from '@/src/features/management-company/api/company-actions';
import { getBusinessInfo, getBusinessCategories, getBusinessAchievementsUsingAnonymous } from '@/src/features/management-business/api/business-actions';
import { getCarouselData } from '@/src/features/prologue/api/prologue-actions';

export default async function HomePage() {
    const [aboutInfo, businessInfo, categories, achievements, carouselData] = await Promise.all([
        getCompanyAboutInfo(),
        getBusinessInfo(),
        getBusinessCategories(),
        getBusinessAchievementsUsingAnonymous(),
        getCarouselData(),
    ]);

    return (
        <main>
            <div className="relative bg-[#F4F6F8]">
                <Header />
                <Hero
                    items={carouselData.items}
                    defaultTitle={carouselData.defaultTitle}
                    defaultDescription={carouselData.defaultDescription}
                />
            </div>
            <About aboutInfo={aboutInfo} />
            <Business
                businessInfo={businessInfo}
                categories={categories}
                achievements={achievements}
            />
            <Products />
            <Contact />
            <Footer />
        </main>
    );
}
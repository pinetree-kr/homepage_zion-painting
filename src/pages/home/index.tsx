"use server"

import Header from '@/src/features/home/ui/Header';
import Hero from '@/src/features/home/ui/Hero';
import About from '@/src/features/home/ui/About';
import Business from '@/src/features/home/ui/Business';
import Products from '@/src/features/home/ui/Products';
import Contact from '@/src/features/home/ui/Contact';
import Footer from '@/src/features/home/ui/Footer';
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


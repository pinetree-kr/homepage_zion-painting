import { Header, Hero, About, Business, Products, Contact, Footer } from '@/src/features/home';

export default function HomePage() {
    return (
        <main>
            <div className="relative bg-[#F4F6F8]">
                <Header />
                <Hero />
            </div>
            <About />
            <Business />
            <Products />
            <Contact />
            <Footer />
        </main>
    );
}


import Hero from './Hero';
import About from './About';
import Business from './Business';
import Products from './Products';
import Contact from './Contact';
import Footer from './Footer';
import Header from './Header';

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


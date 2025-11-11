import Header from './components/layout/Header';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Business from './components/sections/Business';
import Products from './components/sections/Products';
import Contact from './components/sections/Contact';
import Footer from './components/sections/Footer';

export default function Home() {
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

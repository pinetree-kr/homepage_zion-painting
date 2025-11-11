import { Header } from '@/src/widgets/header';
import { Hero, About, Business, Products, Contact, Footer } from '@/src/pages/home';

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

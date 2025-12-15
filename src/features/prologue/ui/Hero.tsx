import HeroCarousel from './HeroCarousel';
import HeroContent from './HeroContent';

const DEFAULT_TITLE = '시온에 오신것을 환영합니다';
const DEFAULT_DESCRIPTION = '';

export interface HeroCarouselItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface HeroProps {
  items: HeroCarouselItem[];
  defaultTitle: string;
  defaultDescription: string;
}

export default function Hero({ items, defaultTitle, defaultDescription }: HeroProps) {

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Carousel 배경 */}
      <div className="absolute inset-0 z-0">
        <HeroCarousel
          items={items?.filter((item) => item.src !== '') || []}
          defaultTitle={defaultTitle || DEFAULT_TITLE}
          defaultDescription={defaultDescription || DEFAULT_DESCRIPTION}
        />
      </div>

      {/* 배경 원형 요소들 */}
      {/* <div className="absolute inset-0 opacity-20 z-[1]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 md:right-40 w-72 h-72 bg-[#A5C93E] rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#2CA7DB] rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div> */}

      <HeroContent
        defaultTitle={defaultTitle || DEFAULT_TITLE}
        defaultDescription={defaultDescription || DEFAULT_DESCRIPTION}
      />
    </section>
  );
}


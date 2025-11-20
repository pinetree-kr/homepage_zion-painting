"use server"

import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { PrologueCarouselItem } from '@/src/entities/prologue/model/types';
import HeroCarousel from './HeroCarousel';
import HeroContent from './HeroContent';

const DEFAULT_TITLE = '시온에 오신것을 환영합니다';
const DEFAULT_DESCRIPTION = '';

interface HeroCarouselItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

async function getCarouselData() {
  "use server"
  const supabase = await createServerClient();

  try {
    // prologue_settings 로드
    const { data: settingsData, error: settingsError } = await supabase
      .from('prologue_settings')
      .select('default_title, default_description')
      .single() as {
        data: {
          default_title: string | null;
          default_description: string | null;
        } | null; error: any
      };

    let settingsDefaultTitle: string | null = null;
    let settingsDefaultDescription: string | null = null;

    if (settingsError && settingsError.code !== 'PGRST116') {
      // PGRST116은 레코드가 없을 때 발생하는 에러 (무시)
      console.error('프롤로그 설정 로드 오류:', settingsError);
    } else if (settingsData) {
      settingsDefaultTitle = settingsData.default_title;
      settingsDefaultDescription = settingsData.default_description;
    }

    // 타이틀 우선순위 결정 함수
    const getTitleWithPriority = (carouselItemTitle: string | null | undefined): string => {
      // 1. 캐러셀 아이템의 타이틀
      if (carouselItemTitle) {
        return carouselItemTitle;
      }
      // 2. prologue_settings의 디폴트 타이틀
      if (settingsDefaultTitle) {
        return settingsDefaultTitle;
      }
      // 3. 하위 호환성: 기존 text 필드 사용
      // 4. 인라인 디폴트 타이틀
      return DEFAULT_TITLE;
    };

    // 설명 우선순위 결정 함수
    const getDescriptionWithPriority = (carouselItemDescription: string | null | undefined): string => {
      // 1. 캐러셀 아이템의 설명
      if (carouselItemDescription) {
        return carouselItemDescription;
      }
      // 2. prologue_settings의 디폴트 설명
      if (settingsDefaultDescription) {
        return settingsDefaultDescription;
      }
      // 3. 인라인 디폴트 설명
      return DEFAULT_DESCRIPTION;
    };

    // 하위 호환성을 위한 텍스트 우선순위 결정 함수
    // 캐러셀 아이템 로드
    const { data, error } = await supabase
      .from('prologue_carousel_items')
      .select('*')
      .order('display_order', { ascending: true })
      .overrideTypes<PrologueCarouselItem[]>();

    if (error) {
      console.error('캐러셀 데이터 로드 오류:', error);
      return {
        items: [] as HeroCarouselItem[],
      };
    }

    if (data && data.length > 0) {
      const items: HeroCarouselItem[] = data.map((item) => ({
        id: item.id,
        src: item.image_url,
        alt: getTitleWithPriority(item.title),
        title: getTitleWithPriority(item.title),
        description: getDescriptionWithPriority(item.description),
      } as HeroCarouselItem));

      return {
        items,
        defaultTitle: items[0]?.title || getTitleWithPriority(null),
        defaultDescription: items[0]?.description || getDescriptionWithPriority(null),
      };
    } else {
      return {
        items: [] as HeroCarouselItem[],
        defaultTitle: getTitleWithPriority(null),
        defaultDescription: getDescriptionWithPriority(null),
      };
    }
  } catch (error) {
    console.error('데이터 로드 중 오류:', error);
    return {
      items: [] as HeroCarouselItem[],
      defaultTitle: DEFAULT_TITLE,
      defaultDescription: DEFAULT_DESCRIPTION,
      defaultText: DEFAULT_TITLE, // 하위 호환성
    };
  }
}

export default async function Hero() {
  const { items, defaultTitle, defaultDescription, defaultText } = await getCarouselData();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Carousel 배경 */}
      <div className="absolute inset-0 z-0">
        <HeroCarousel
          items={items}
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


'use server';

import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import type { HeroCarouselItem } from '@/src/features/prologue/ui/Hero';

const DEFAULT_TITLE = '시온에 오신것을 환영합니다';
const DEFAULT_DESCRIPTION = '';

interface CarouselItemMetadata {
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
}

export async function getCarouselData() {
  const supabase = createAnonymousServerClient();

  try {
    // hero_default 페이지에서 기본 설정 로드
    const { data: heroDefaultData, error: heroDefaultError } = await supabase
      .from('pages')
      .select('metadata')
      .eq('code', 'hero_default')
      .eq('status', 'published')
      .maybeSingle() as {
        data: {
          metadata: {
            default_title?: string | null;
            default_description?: string | null;
          };
        } | null;
        error: any;
      };

    let settingsDefaultTitle: string | null = null;
    let settingsDefaultDescription: string | null = null;

    if (heroDefaultError && heroDefaultError.code !== 'PGRST116') {
      console.error('hero_default 페이지 로드 오류:', heroDefaultError);
    } else if (heroDefaultData?.metadata) {
      settingsDefaultTitle = heroDefaultData.metadata.default_title || null;
      settingsDefaultDescription = heroDefaultData.metadata.default_description || null;
    }

    // 타이틀 우선순위 결정 함수
    const getTitleWithPriority = (carouselItemTitle: string | null | undefined): string => {
      // 1. 캐러셀 아이템의 타이틀
      if (carouselItemTitle) {
        return carouselItemTitle;
      }
      // 2. hero_default의 디폴트 타이틀
      if (settingsDefaultTitle) {
        return settingsDefaultTitle;
      }
      // 3. 인라인 디폴트 타이틀
      return DEFAULT_TITLE;
    };

    // 설명 우선순위 결정 함수
    const getDescriptionWithPriority = (carouselItemDescription: string | null | undefined): string => {
      // 1. 캐러셀 아이템의 설명
      if (carouselItemDescription) {
        return carouselItemDescription;
      }
      // 2. hero_default의 디폴트 설명
      if (settingsDefaultDescription) {
        return settingsDefaultDescription;
      }
      // 3. 인라인 디폴트 설명
      return DEFAULT_DESCRIPTION;
    };

    // hero_carousel_items 페이지에서 캐러셀 아이템 로드
    const { data: carouselData, error: carouselError } = await supabase
      .from('pages')
      .select('metadata')
      .eq('code', 'hero_carousel_items')
      .eq('status', 'published')
      .maybeSingle() as {
        data: {
          metadata: {
            items?: CarouselItemMetadata[];
          };
        } | null;
        error: any;
      };

    if (carouselError && carouselError.code !== 'PGRST116') {
      console.error('캐러셀 데이터 로드 오류:', carouselError);
      return {
        items: [] as HeroCarouselItem[],
        defaultTitle: getTitleWithPriority(null),
        defaultDescription: getDescriptionWithPriority(null),
      };
    }

    const itemsArray = carouselData?.metadata?.items || [];
    
    if (itemsArray.length > 0) {
      // display_order 기준으로 정렬
      const sortedItems = [...itemsArray].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      
      const items: HeroCarouselItem[] = sortedItems.map((item, index) => ({
        id: `carousel-item-${index}`,
        src: item.image_url || '',
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
    };
  }
}


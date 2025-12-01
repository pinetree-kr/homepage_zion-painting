'use server';

import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import type { PrologueCarouselItem } from '@/src/entities/prologue/model/types';
import type { HeroCarouselItem } from '@/src/features/prologue/ui/Hero';

const DEFAULT_TITLE = '시온에 오신것을 환영합니다';
const DEFAULT_DESCRIPTION = '';

export async function getCarouselData() {
  const supabase = createAnonymousServerClient();

  try {
    // site_settings에서 prologue 설정 로드
    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('prologue_default_title, prologue_default_description')
      .is('deleted_at', null)
      .maybeSingle() as {
        data: {
          prologue_default_title: string | null;
          prologue_default_description: string | null;
        } | null; error: any
      };

    let settingsDefaultTitle: string | null = null;
    let settingsDefaultDescription: string | null = null;

    if (settingsError && settingsError.code !== 'PGRST116') {
      // PGRST116은 레코드가 없을 때 발생하는 에러 (무시)
      console.error('사이트 설정 로드 오류:', settingsError);
    } else if (settingsData) {
      settingsDefaultTitle = settingsData.prologue_default_title;
      settingsDefaultDescription = settingsData.prologue_default_description;
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
        defaultTitle: DEFAULT_TITLE,
        defaultDescription: DEFAULT_DESCRIPTION,
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
    };
  }
}


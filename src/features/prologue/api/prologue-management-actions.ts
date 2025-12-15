'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { Page } from '@/src/shared/lib/model';

export interface PrologueManagementData {
  defaultTitle: string;
  defaultDescription: string;
  carouselItems: Array<{
    id: string;
    dbId: string;
    imageUrl: string;
    imagePath?: string;
    title: string;
    description: string;
    order: number;
  }>;
}

/**
 * 프롤로그 관리 페이지용 초기 데이터 로드
 */
export async function getPrologueManagementData(): Promise<PrologueManagementData> {
  try {
    const supabase = await createServerClient();

    // hero_default 페이지에서 기본 설정 로드
    const { data: heroDefaultData, error: heroDefaultError } = await supabase
      .from('pages')
      .select('id, default_title:metadata->>default_title, default_description:metadata->>default_description')
      .eq('code', 'hero_default')
      .eq('status', 'published')
      .maybeSingle();

    let defaultTitle = '';
    let defaultDescription = '';

    if (heroDefaultError && heroDefaultError.code !== 'PGRST116') {
      console.error('hero_default 페이지 로드 오류:', heroDefaultError);
    } else if (heroDefaultData?.default_title && heroDefaultData?.default_description) {
      defaultTitle = heroDefaultData.default_title || '';
      defaultDescription = heroDefaultData.default_description || '';
    }

    // hero_carousel_items 페이지에서 캐러셀 아이템 로드
    const { data: carouselData, error: carouselError } = await supabase
      .from('pages')
      .select('id, carousel_items:metadata->items')
      .eq('code', 'hero_carousel_items')
      .eq('status', 'published')
      .maybeSingle();

    let carouselItems: PrologueManagementData['carouselItems'] = [];

    if (carouselError && carouselError.code !== 'PGRST116') {
      console.error('캐러셀 아이템 로드 오류:', carouselError);
    } else if (carouselData?.carousel_items) {
      // const itemsArray = JSON.parse(carouselData.carousel_items) as Array<{
      //   image_url: string;
      //   title: string;
      //   description: string;
      //   display_order: number;
      // }>;
      const itemsArray = carouselData?.carousel_items as Array<{
        image_url: string;
        title: string;
        description: string;
        display_order: number;
      }>;

      // display_order 기준으로 정렬
      const sortedItems = [...itemsArray].sort((a, b) => (a.display_order as number || 0) - (b.display_order as number || 0));

      carouselItems = sortedItems.map((item, index) => ({
        id: `carousel-item-${index}`,
        dbId: `carousel-item-${index}`, // pages 테이블에서는 개별 ID가 없으므로 인덱스 기반 ID 사용
        imageUrl: item.image_url as string || '',
        imagePath: item.image_url?.replace(/^.*\/storage\/v1\/object\/public\/prologue-carousel\//, '') || undefined,
        title: item.title as string || '',
        description: item.description as string || '',
        order: item.display_order as number || index + 1,
      }));
    }

    return {
      defaultTitle: heroDefaultData?.default_title || '',
      defaultDescription: heroDefaultData?.default_description || '',
      carouselItems,
    };
  } catch (error) {
    console.error('프롤로그 관리 데이터 로드 중 오류:', error);
    return {
      defaultTitle: '',
      defaultDescription: '',
      carouselItems: [],
    };
  }
}

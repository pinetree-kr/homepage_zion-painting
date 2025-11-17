
// prologue_settings 테이블 타입 정의
export interface PrologueSettings {
    id: string;
    default_title: string | null;
    default_description: string | null;
    created_at: string;
    updated_at: string;
}

// prologue_carousel_items 테이블 타입 정의
export interface PrologueCarouselItem {
    id: string;
    image_url: string;
    title: string | null;
    description: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
}
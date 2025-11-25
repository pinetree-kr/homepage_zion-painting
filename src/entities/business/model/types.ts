export interface BusinessInfo {
  id: string;
  introduction?: string | null;
  areas?: BusinessArea[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BusinessArea {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  features?: string[];
  display_order?: number;
}

export interface BusinessCategory {
  id: string;
  title: string;
  display_order?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  content: string;
  achievement_date: string;
  category_id?: string | null;
  thumbnail_url?: string | null;
  content_summary?: string | null; // DB에 저장되는 요약 필드 (최대 50자)
  created_at?: string | null;
  updated_at?: string | null;
}


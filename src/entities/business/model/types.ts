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
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  content: string;
  achievement_date: string;
  category_id?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}


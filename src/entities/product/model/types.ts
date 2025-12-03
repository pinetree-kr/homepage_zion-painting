export interface Product {
  id: string;
  title: string;
  content: string;
  content_summary?: string | null;
  category_id?: string | null;
  specs?: any | null; // JSONB 타입
  status: "draft" | "published";
  thumbnail_url?: string | null;
  extra_json?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface ProductCategory {
  id: string;
  title: string;
  display_order?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductInfo {
  id: string;
  introduction?: string | null;
  review_board_id?: string | null;
  quote_board_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}


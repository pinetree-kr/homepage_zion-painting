export interface Board {
  id: string;
  code: string;
  name: string;
  description: string;
  is_public: boolean;
  allow_anonymous: boolean;
  allow_comment: boolean;
  allow_file: boolean;
  allow_guest: boolean;
  allow_secret: boolean;
  display_order: number;
  allow_product_link: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
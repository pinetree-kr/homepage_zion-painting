export type VisibleType = 'public' | 'member' | 'owner';
export type AppRole = 'member' | 'admin';

export interface Board {
  id: string;
  code: string;
  name: string;
  description: string;
  is_public: boolean;
  visibility?: VisibleType;
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

export interface BoardPolicy {
  board_id: string;
  role: AppRole;
  post_list: boolean;
  post_create: boolean;
  post_read: boolean;
  post_edit: boolean;
  post_delete: boolean;
  cmt_create: boolean;
  cmt_read: boolean;
  cmt_edit: boolean;
  cmt_delete: boolean;
  file_upload: boolean;
  file_download: boolean;
  created_at: string | null;
  updated_at: string | null;
}
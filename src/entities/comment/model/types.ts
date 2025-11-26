export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string | null;
  author_name: string | null;
  author_ip: string | null;
  context: string;
  status: 'draft' | 'published';
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}


// export interface Post {
//   id: string;
//   type: 'notice' | 'qna' | 'quote' | 'review';
//   title: string;
//   content: string;
//   author: string;
//   createdAt: string;
//   status: 'published' | 'draft';
//   imageUrl?: string;
//   category?: string;
// }


export interface PostFile {
  file_url: string; // 고유 식별자로 사용
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PostContentMetadata {
  thumbnail_url?: string | null;
  summary?: string;
  is_secret?: boolean;
}

export interface Post {
  id: string;
  board_id: string | null;
  category_id: string | null;
  title: string;
  content: string;
  content_metadata?: PostContentMetadata | null;
  author_id: string | null;
  author_metadata?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  status: 'draft' | 'published';
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  files?: PostFile[] | null;
  extra_json: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
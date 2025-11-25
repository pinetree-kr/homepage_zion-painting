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


export interface Post {
  id: string;
  board_id: string | null;
  category_id: string | null;
  title: string;
  content: string;
  content_summary: string;
  author_id: string | null;
  author_name: string | null;
  author_email: string | null;
  author_phone: string | null;
  status: 'draft' | 'published';
  is_pinned: boolean;
  is_secret: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  thumbnail_url: string | null;
  extra_json: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
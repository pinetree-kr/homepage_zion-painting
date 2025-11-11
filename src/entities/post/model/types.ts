export interface Post {
  id: string;
  type: 'notice' | 'qna' | 'quote' | 'review';
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status: 'published' | 'draft';
  imageUrl?: string;
  category?: string;
}


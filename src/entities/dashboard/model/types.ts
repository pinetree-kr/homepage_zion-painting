export interface DashboardStats {
  totalMembers: number;
  recentMembers: number; // 최근 일주일
}

export interface RecentPost {
  id: string;
  type: 'qna' | 'quote';
  title: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  status: 'published' | 'draft';
  category?: string | null;
}

export interface EmptyInfo {
  type: 'company' | 'business' | 'contact';
  field: string;
  label: string;
}


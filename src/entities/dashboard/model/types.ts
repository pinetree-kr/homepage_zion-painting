import { Post } from "../../post/model/types";

export interface DashboardStats {
  totalMembers: number;
  recentMembers: number; // 최근 일주일
}

export interface EmptyInfo {
  type: 'company' | 'business' | 'contact' | 'settings';
  field: string;
  label: string;
}
export interface RecentPosts {
  board_id?: string | null;
  items: Omit<Post,
    'like_count' | 'comment_count' | 'extra_json' | 'deleted_at'
    | 'is_pinned' | 'view_count' | 'updated_at'
  >[]
}

export interface DashboardStats {
  totalMembers: number;
  recentMembers: number; // 최근 일주일
}

export interface EmptyInfo {
  type: 'company' | 'business' | 'contact';
  field: string;
  label: string;
}


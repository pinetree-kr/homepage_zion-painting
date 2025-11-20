export interface CompanyInfo {
  id: string;
  about_content: string | null;
  organization_content: string | null;
  histories?: CompanyHistory[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// export type CompanyHistoryType = 'business' | 'certification'
export type CompanyHistoryType = "biz" | "cert";
export interface CompanyHistory {
  id: string;
  year: string;
  month: string | null;
  content: string;
  type: CompanyHistoryType;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}
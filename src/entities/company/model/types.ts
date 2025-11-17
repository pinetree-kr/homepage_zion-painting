export interface CompanyInfo {
  id: string;
  about_content: string | null;
  organization_content: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CompanyHistory {
  id: string;
  year: string;
  month: string | null;
  content: string;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}
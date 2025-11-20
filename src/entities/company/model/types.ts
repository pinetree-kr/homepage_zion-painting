export interface CompanyInfo {
  id: string;
  introduction?: string | null;
  vision?: string | null;
  greetings?: string | null;
  mission?: string | null;
  strengths?: CompanyStrength[] | null;
  values?: CompanyValue[] | null;
  histories?: CompanyHistory[] | null;
  organization_members?: OrganizationMember[] | null;
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

export interface OrganizationMember {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CompanyStrength {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
}

export interface CompanyAbout {
  introduction: string;
  strengths: CompanyStrength[];
  vision: string;
  values: CompanyValue[];
  greetings: string;
  mission: string;
}
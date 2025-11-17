/**
 * Supabase 데이터베이스 타입 정의
 * 
 * Supabase CLI를 사용하여 타입을 자동 생성하려면:
 * npx supabase gen types typescript --project-id [your-project-id] > src/shared/lib/supabase-types.ts
 * 
 * 또는 Supabase 대시보드에서 직접 생성된 타입을 복사하여 사용할 수 있습니다.
 */


// profiles 테이블 타입 정의
export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: 'admin' | 'user' | null;
  status: 'active' | 'inactive' | null;
  email_verified: boolean | null;
  last_login: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// administrators 테이블 타입 정의
export interface Administrator {
  id: string;
  role: 'system' | 'contents';
  created_at: string;
  updated_at: string;
}

// prologue_settings 테이블 타입 정의
export interface PrologueSettings {
  id: string;
  default_title: string | null;
  default_description: string | null;
  created_at: string;
  updated_at: string;
}

// prologue_carousel_items 테이블 타입 정의
export interface PrologueCarouselItem {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// company_info 테이블 타입 정의
export interface CompanyInfo {
  id: string;
  about_content: string | null;
  organization_content: string | null;
  created_at: string;
  updated_at: string;
}

// company_history 테이블 타입 정의
export interface CompanyHistory {
  id: string;
  year: string;
  month: string | null;
  content: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// 기본 타입 정의 (실제 데이터베이스 스키마에 맞게 수정 필요)
export interface Tables {
  profiles: {
    Row: Profile;
    Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<Profile, 'id' | 'created_at'>> & {
      updated_at?: string;
    };
  };
  administrators: {
    Row: Administrator;
    Insert: Omit<Administrator, 'created_at' | 'updated_at'> & {
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<Administrator, 'id' | 'created_at'>> & {
      updated_at?: string;
    };
  };
  prologue_settings: {
    Row: PrologueSettings;
    Insert: Omit<PrologueSettings, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<PrologueSettings, 'id' | 'created_at'>> & {
      updated_at?: string;
    };
  };
  prologue_carousel_items: {
    Row: PrologueCarouselItem;
    Insert: Omit<PrologueCarouselItem, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<PrologueCarouselItem, 'id' | 'created_at'>> & {
      updated_at?: string;
    };
  };
  company_info: {
    Row: CompanyInfo;
    Insert: Omit<CompanyInfo, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<CompanyInfo, 'id' | 'created_at'>> & {
      updated_at?: string;
    };
  };
  company_history: {
    Row: CompanyHistory;
    Insert: Omit<CompanyHistory, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<CompanyHistory, 'id' | 'created_at'>> & {
      updated_at?: string;
    };
  };
  // 추가 테이블 타입들을 여기에 정의
}

export type Database = {
  public: {
    Tables: Tables;
  };
};


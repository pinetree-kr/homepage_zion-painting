import type { MapConfig } from '@/src/entities/site-setting/model/types';

export interface ContactInfo {
  id: string;
  email: string;
  address: string;
  business_hours: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  fax: string | null;
  map_url: string | null; // deprecated: 하위 호환성을 위해 유지
  maps: MapConfig[] | null; // 새로운 지도 설정 배열
  created_at: string | null;
  updated_at: string | null;
}


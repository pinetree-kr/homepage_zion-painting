export interface Page<T = any> {
  id: string;
  code: string;
  page: string;
  section_type: string;
  display_order: number;
  status: string;
  metadata: T;
  created_at?: string | null;
  updated_at?: string | null;
}
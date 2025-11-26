'use client';

import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import type { CompanyAbout, CompanyStrength, CompanyValue } from '@/src/entities/company/model/types';

/**
 * 클라이언트 사이드에서 회사소개 정보 로드
 */
export async function fetchCompanyAboutInfo(): Promise<CompanyAbout> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('company_info')
      .select('introduction, vision, greetings, mission, strengths, values')
      .limit(1)
      .maybeSingle() as {
        data: {
          introduction: string | null;
          vision: string | null;
          greetings: string | null;
          mission: string | null;
          strengths: CompanyStrength[] | null;
          values: CompanyValue[] | null;
        } | null;
        error: any;
      };

    if (error) {
      console.error('회사소개 정보 로드 오류:', error);
      return {
        introduction: '',
        strengths: [],
        vision: '',
        values: [],
        greetings: '',
        mission: '',
      };
    }

    if (!data) {
      return {
        introduction: '',
        strengths: [],
        vision: '',
        values: [],
        greetings: '',
        mission: '',
      };
    }

    return {
      introduction: data.introduction || '',
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      vision: data.vision || '',
      values: Array.isArray(data.values) ? data.values : [],
      greetings: data.greetings || '',
      mission: data.mission || '',
    };
  } catch (error) {
    console.error('회사소개 정보 로드 중 예외 발생:', error);
    return {
      introduction: '',
      strengths: [],
      vision: '',
      values: [],
      greetings: '',
      mission: '',
    };
  }
}

/**
 * 클라이언트 사이드에서 개별 필드 로드
 */
export async function fetchCompanyAboutField(field: 'introduction'): Promise<string>;
export async function fetchCompanyAboutField(field: 'vision'): Promise<string>;
export async function fetchCompanyAboutField(field: 'greetings'): Promise<string>;
export async function fetchCompanyAboutField(field: 'mission'): Promise<string>;
export async function fetchCompanyAboutField(field: 'strengths'): Promise<CompanyStrength[]>;
export async function fetchCompanyAboutField(field: 'values'): Promise<CompanyValue[]>;
export async function fetchCompanyAboutField(
  field: keyof CompanyAbout
): Promise<string | CompanyStrength[] | CompanyValue[]> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('company_info')
      .select(field)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`${field} 로드 오류:`, error);
      if (field === 'strengths' || field === 'values') {
        return [];
      }
      return '';
    }

    if (!data) {
      if (field === 'strengths' || field === 'values') {
        return [];
      }
      return '';
    }

    const value = (data as any)[field];
    if (field === 'strengths' || field === 'values') {
      return Array.isArray(value) ? value : [];
    }
    return value || '';
  } catch (error) {
    console.error(`${field} 로드 중 예외 발생:`, error);
    if (field === 'strengths' || field === 'values') {
      return [];
    }
    return '';
  }
}


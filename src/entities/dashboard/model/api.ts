"use server"

import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { DashboardStats, EmptyInfo, RecentPosts } from './types';
import { getDaysAgoStartISOString } from '@/src/shared/lib/utils';

/**
 * 대시보드 통계 조회
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = await createServerClient();

    // 전체 가입자 수
    const { count: totalCount, error: totalError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (totalError) {
      console.error('전체 가입자 수 조회 오류:', totalError);
      throw totalError;
    }

    // 최근 일주일 가입자 수
    const oneWeekAgoISO = getDaysAgoStartISOString(7);

    const { count: recentCount, error: recentError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgoISO);

    if (recentError) {
      console.error('최근 가입자 수 조회 오류:', recentError);
      throw recentError;
    }

    return {
      totalMembers: totalCount || 0,
      recentMembers: recentCount || 0,
    };
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return {
      totalMembers: 0,
      recentMembers: 0,
    };
  }
}



/**
 * 최근 문의글 조회 (최대 5개)
 */
export async function getRecentQnA(limit: number = 5): Promise<RecentPosts> {
  try {
    const supabase = await createServerClient();

    const { data: settingData, error: settingDataError } = await supabase
      .from('site_settings')
      .select('inquiry_board_id:default_boards->inquiry->id')
      .maybeSingle();

    if (settingDataError) {
      console.error('일반 문의글 게시판 조회 오류:', settingDataError);
      return {
        board_id: null,
        items: [],
      };
    }

    if (!settingData?.inquiry_board_id) {
      console.log('일반 문의글 게시판 설정이 안되어 있습니다.');
      return {
        board_id: null,
        items: [],
      };
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        content_metadata,
        status,
        category:board_categories!inner (
          title
        ),
        author_id,
        author_metadata,
        created_at
      `)
      .is('deleted_at', null)
      .eq('status', 'published')
      .eq('board_id', settingData.inquiry_board_id as string)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('최근 일반 문의글 조회 오류:', error);
      throw error;
    }

    const items = (data || []).map((post: any) => ({
      id: post.id,
      board_id: post.board_id,
      category_id: post.category_id || null,
      title: post.title,
      content: post.content,
      content_metadata: post.content_metadata || { thumbnail_url: null, summary: '' },
      author_id: post.author_id || null,
      author_name: post.author_metadata?.name || null,
      author_email: post.author_metadata?.email || null,
      author_phone: post.author_metadata?.phone || null,
      status: post.status as 'published' | 'draft',
      created_at: post.created_at || null,
    }));

    return {
      board_id: settingData.inquiry_board_id as string,
      items,
    }
  } catch (error) {
    console.error('최근 일반 문의글 조회 오류:', error);
    return {
      board_id: null,
      items: [],
    };
  }
}

/**
 * 최근 견적글 조회 (최대 5개)
 */
export async function getRecentQuotes(limit: number = 5): Promise<RecentPosts> {
  try {
    const supabase = await createServerClient();

    const { data: settingData, error: settingDataError } = await supabase
      .from('site_settings')
      .select('quote_board_id:default_boards->quote->id')
      .maybeSingle();

    if (settingDataError) {
      console.error('견적 문의글 게시판 조회 오류:', settingDataError);
      return {
        board_id: null,
        items: [],
      };
    }

    if (!settingData?.quote_board_id) {
      console.log('견적 문의글 게시판 설정이 안되어 있습니다.');
      return {
        board_id: null,
        items: [],
      };
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        content_metadata,
        status,
        category:board_categories!inner (
          title
        ),
        author_id,
        author_metadata,
        created_at
      `)
      .is('deleted_at', null)
      .eq('status', 'published')
      .eq('board_id', settingData.quote_board_id as string)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('최근 견적 문의글 조회 오류:', error);
      throw error;
    }



    const items = (data || []).map((post: any) => ({
      id: post.id,
      board_id: post.board_id,
      category_id: post.category_id || null,
      title: post.title,
      content: post.content,
      content_metadata: post.content_metadata || { thumbnail_url: null, summary: '' },
      author_id: post.author_id || null,
      author_name: post.author_metadata?.name || null,
      author_email: post.author_metadata?.email || null,
      author_phone: post.author_metadata?.phone || null,
      status: post.status as 'published' | 'draft',
      created_at: post.created_at || null,
    }));

    return {
      board_id: settingData.quote_board_id as string,
      items,
    }
  } catch (error) {
    console.error('최근 견적 문의글 조회 오류:', error);
    return {
      board_id: null,
      items: [],
    };
  }
}

/**
 * 빈 정보 체크 (회사/사업 관련)
 */
export async function getEmptyInfo(): Promise<EmptyInfo[]> {
  try {
    const supabase = await createServerClient();
    const emptyInfo: EmptyInfo[] = [];

    // 회사 정보 체크
    const { data: companyInfo, error: companyError } = await supabase
      .from('pages')
      .select('metadata->>introduction, metadata->>vision, metadata->>greetings, metadata->>mission, metadata->>strengths, metadata->>values, metadata->>histories, metadata->>organization_members')
      .eq('code', 'company_intro')
      .eq('status', 'published')
      .maybeSingle();

    if (!companyError && companyInfo) {
      if (!companyInfo.introduction || companyInfo.introduction.trim() === '') {
        emptyInfo.push({ type: 'company', field: 'introduction', label: '회사 소개' });
      }
      if (!companyInfo.vision || companyInfo.vision.trim() === '') {
        emptyInfo.push({ type: 'company', field: 'vision', label: '비전' });
      }
      if (!companyInfo.greetings || companyInfo.greetings.trim() === '') {
        emptyInfo.push({ type: 'company', field: 'greetings', label: '인사말' });
      }
      if (!companyInfo.mission || companyInfo.mission.trim() === '') {
        emptyInfo.push({ type: 'company', field: 'mission', label: '미션' });
      }
      if (!companyInfo.strengths || (Array.isArray(companyInfo.strengths) && companyInfo.strengths.length === 0)) {
        emptyInfo.push({ type: 'company', field: 'strengths', label: '핵심 강점' });
      }
      if (!companyInfo.values || (Array.isArray(companyInfo.values) && companyInfo.values.length === 0)) {
        emptyInfo.push({ type: 'company', field: 'values', label: '핵심 가치' });
      }
      if (!companyInfo.histories || (Array.isArray(companyInfo.histories) && companyInfo.histories.length === 0)) {
        emptyInfo.push({ type: 'company', field: 'histories', label: '회사 연혁' });
      }
      if (!companyInfo.organization_members || (Array.isArray(companyInfo.organization_members) && companyInfo.organization_members.length === 0)) {
        emptyInfo.push({ type: 'company', field: 'organization_members', label: '조직 구성원' });
      }
    } else {
      // 회사 정보가 아예 없는 경우
      emptyInfo.push({ type: 'company', field: 'all', label: '회사 정보 전체' });
    }

    // 사업 분야 체크
    const { data: businessAreasInfo, error: businessAreasError } = await supabase
      .from('pages')
      .select('metadata->>areas', { count: 'exact', head: true })
      .eq('code', 'business_areas')
      .eq('status', 'published')
      .maybeSingle();

    if (!businessAreasError && businessAreasInfo) {
      if (!businessAreasInfo.areas || businessAreasInfo.areas.trim() === '') {
        emptyInfo.push({ type: 'business', field: 'areas', label: '사업 분야' });
      }
    }

    // 연락처 정보 체크 (site_settings에서)
    const { data: contactInfo, error: contactError } = await supabase
      .from('site_settings')
      .select('contact, default_boards')
      .is('deleted_at', null)
      .maybeSingle();

    if (!contactError && contactInfo) {
      const contact = (contactInfo.contact as any) || {};
      if (!contact.email || contact.email.trim() === '') {
        emptyInfo.push({ type: 'contact', field: 'email', label: '이메일' });
      }
      if (!contact.address || contact.address.trim() === '') {
        emptyInfo.push({ type: 'contact', field: 'address', label: '주소' });
      }
      if (!contact.phone_primary || contact.phone_primary.trim() === '') {
        emptyInfo.push({ type: 'contact', field: 'phone_primary', label: '대표 전화' });
      }

      // 게시판 연결 설정 체크 (default_boards에서)
      const defaultBoards = (contactInfo.default_boards as any) || {};

      // notice 게시판 체크
      if (!defaultBoards.notice || !defaultBoards.notice.id) {
        emptyInfo.push({ type: 'settings', field: 'notice', label: defaultBoards.notice?.name || '공지사항 게시판' });
      }

      // quote 게시판 체크
      if (!defaultBoards.quote || !defaultBoards.quote.id) {
        emptyInfo.push({ type: 'settings', field: 'quote', label: defaultBoards.quote?.name || '견적문의 게시판' });
      }

      // inquiry 게시판 체크
      if (!defaultBoards.inquiry || !defaultBoards.inquiry.id) {
        emptyInfo.push({ type: 'settings', field: 'inquiry', label: defaultBoards.inquiry?.name || 'Q&A 게시판' });
      }

      // review 게시판 체크
      if (!defaultBoards.review || !defaultBoards.review.id) {
        emptyInfo.push({ type: 'settings', field: 'review', label: defaultBoards.review?.name || '고객후기 게시판' });
      }

      // pds 게시판 체크
      if (!defaultBoards.pds || !defaultBoards.pds.id) {
        emptyInfo.push({ type: 'settings', field: 'pds', label: defaultBoards.pds?.name || '자료실 게시판' });
      }
    } else {
      // 연락처 정보가 아예 없는 경우
      emptyInfo.push({ type: 'contact', field: 'all', label: '연락처 정보 전체' });
      // 게시판 연결 설정도 없는 경우
      emptyInfo.push({ type: 'settings', field: 'all', label: '게시판 연결 설정 전체' });
    }

    return emptyInfo;
  } catch (error) {
    console.error('빈 정보 체크 오류:', error);
    return [];
  }
}


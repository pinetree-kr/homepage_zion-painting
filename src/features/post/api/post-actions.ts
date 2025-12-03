'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';
import type { Post } from '@/src/entities/post/model/types';

/**
 * 게시판 코드로 게시글 목록 조회 (검색 및 페이지네이션 지원, 관리자용)
 */
export async function searchPostsByBoardCodeUsingAdmin(
  boardCode: string,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Post[]; total: number; totalPages: number }> {
  const supabase = await createServerClient();
  return searchPostsByBoardCode(supabase, boardCode, searchTerm, page, itemsPerPage, sortColumn, sortDirection);
}

/**
 * 게시판 코드로 게시글 목록 조회 (검색 및 페이지네이션 지원, supabase 클라이언트 전달)
 */
export async function searchPostsByBoardCode(
  supabase: SupabaseClient<Database>,
  boardCode: string,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Post[]; total: number; totalPages: number }> {
  try {
    // 먼저 board_id를 가져옵니다
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('code', boardCode)
      .single();

    if (boardError || !board) {
      console.error('게시판 조회 오류:', boardError);
      return { data: [], total: 0, totalPages: 0 };
    }

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('board_id', board.id)
      .is('deleted_at', null);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 전체 개수 조회
    const { count, error: countError } = await query;

    if (countError) {
      console.error('게시글 개수 조회 오류:', countError);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let dataQuery = supabase
      .from('posts')
      .select('*')
      .eq('board_id', board.id)
      .is('deleted_at', null)
      .range(from, to);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      dataQuery = dataQuery.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 정렬 적용
    // 고정 게시글은 항상 먼저 표시
    dataQuery = dataQuery.order('is_pinned', { ascending: false });

    if (sortColumn) {
      // 컬럼 ID를 DB 컬럼명으로 매핑
      const columnMapping: Record<string, string> = {
        'title': 'title',
        'author': 'author_name',
        'status': 'status',
        'created_at': 'created_at',
        'view_count': 'view_count',
        'like_count': 'like_count',
        'comment_count': 'comment_count',
      };

      const dbColumn = columnMapping[sortColumn];
      if (dbColumn) {
        dataQuery = dataQuery
          .order(dbColumn, { ascending: sortDirection === 'asc' })
          .order('created_at', { ascending: false });
      } else {
        // 기본 정렬: created_at 내림차순
        dataQuery = dataQuery.order('created_at', { ascending: false });
      }
    } else {
      // 정렬이 없으면 기본 정렬: created_at 내림차순
      dataQuery = dataQuery.order('created_at', { ascending: false });
    }

    const { data, error } = await dataQuery as {
      data: Post[] | null;
      error: any;
    };

    if (error) {
      console.error('게시글 로드 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    return {
      data: data || [],
      total,
      totalPages
    };
  } catch (error) {
    console.error('게시글 검색 중 예외 발생:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * 단일 게시글 조회 (관리자용)
 */
export async function getPostUsingAdmin(id: string): Promise<Post | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle() as {
        data: Post | null;
        error: any;
      };

    if (error) {
      console.error('게시글 조회 오류:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('게시글 조회 중 예외 발생:', error);
    return null;
  }
}

/**
 * HTML에서 텍스트만 추출하고 길이를 제한합니다.
 */
function stripHtmlAndTruncate(html: string, maxLength: number = 50): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // HTML 태그 제거
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  // 길이 제한
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
  }

  return text;
}

/**
 * 게시글 저장
 */
export async function savePost(
  post: Omit<Post, 'id' | 'view_count' | 'like_count' | 'comment_count' | 'created_at' | 'updated_at' | 'deleted_at'> & {
    id?: string | null;
    boardCode: 'notices' | 'qna' | 'quotes' | 'reviews';
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    // 사용자 인증 상태 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    // 관리자 여부 확인
    const { data: adminData, error: adminError } = await supabase
      .from('administrators')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (adminError || !adminData) {
      return { success: false, error: '관리자 권한이 필요합니다.' };
    }

    // 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, phone')
      .eq('id', user.id)
      .single();

    // board_id 가져오기
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('code', post.boardCode)
      .single();

    if (boardError || !board) {
      return { success: false, error: '게시판을 찾을 수 없습니다.' };
    }

    // content_summary 자동 생성
    const contentSummary = stripHtmlAndTruncate(post.content || '', 50);

    const postData: any = {
      board_id: board.id,
      category_id: post.category_id || null,
      title: post.title || '',
      content: post.content || '',
      content_summary: contentSummary,
      author_id: user.id,
      author_name: post.author_name || profile?.name || null,
      author_email: post.author_email || profile?.email || null,
      author_phone: post.author_phone || profile?.phone || null,
      status: post.status || 'draft',
      is_pinned: post.is_pinned || false,
      is_secret: post.is_secret || false,
      thumbnail_url: post.thumbnail_url || null,
      extra_json: post.extra_json || null,
    };

    if (post.id) {
      // 업데이트
      const { error, data } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', post.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      // const revalidatePathValue = post.boardCode === 'quotes' ? '/admin/customer/estimates' : `/admin/customer/${post.boardCode}`;
      const revalidatePathValue = `/admin/boards/${post.boardCode}`;
      revalidatePath(revalidatePathValue);
      revalidatePath(`${revalidatePathValue}/${post.id}`);

      return { success: true, id: data.id };
    } else {
      // 새로 생성
      const { error, data } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error('게시글 생성 오류:', error);
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      // const revalidatePathValue = post.boardCode === 'quote' ? '/admin/customer/estimates' : `/admin/customer/${post.boardCode}`;
      const revalidatePathValue = `/admin/boards/${post.boardCode}`;
      revalidatePath(revalidatePathValue);

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    console.error('게시글 저장 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 게시글 삭제 (soft delete)
 */
export async function deletePost(id: string, boardCode: 'notices' | 'qna' | 'quotes' | 'reviews'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    const revalidatePathValue = `/admin/boards/${boardCode}`;
    revalidatePath(revalidatePathValue);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 제품 리뷰 정보 저장/업데이트 (posts와 products 모두 참조)
 */
export async function saveProductReview(
  postId: string,
  productId: string,
  reviewData: {
    rating?: number;
    pros?: string;
    cons?: string;
    purchase_date?: string;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 리뷰 확인
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('post_id', postId)
      .is('deleted_at', null)
      .maybeSingle();

    const reviewDataToSave: any = {
      post_id: postId,
      product_id: productId,
      rating: reviewData.rating || 0,
      pros: reviewData.pros || '',
      cons: reviewData.cons || '',
      purchase_date: reviewData.purchase_date || new Date().toISOString().split('T')[0],
    };

    if (existingReview) {
      // 업데이트
      const { error } = await supabase
        .from('product_reviews')
        .update(reviewDataToSave)
        .eq('post_id', postId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: existingReview.id };
    } else {
      // 새로 생성
      const { data, error } = await supabase
        .from('product_reviews')
        .insert(reviewDataToSave)
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * @deprecated saveProductReview를 사용하세요
 */
export async function savePostReview(
  productId: string,
  reviewData: {
    title: string;
    content: string;
    rating?: number;
    pros?: string;
    cons?: string;
    purchase_date?: string;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  return { success: false, error: '이 함수는 더 이상 사용되지 않습니다. saveProductReview를 사용하세요.' };
}

/**
 * 제품 문의 정보 저장/업데이트 (posts와 products 모두 참조)
 */
export async function saveProductInquiry(
  postId: string,
  productId: string,
  inquiryData: {
    type?: 'general' | 'quote';
    company_name?: string | null;
    budget_min?: number;
    budget_max?: number;
    expected_start_at?: string | null;
    expected_end_at?: string | null;
    priority?: 'low' | 'medium' | 'high';
    inquiry_status?: 'pending' | 'approved' | 'answered' | 'rejected';
    internal_notes?: string | null;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 문의 확인
    const { data: existingInquiry } = await supabase
      .from('product_inquiries')
      .select('id')
      .eq('post_id', postId)
      .is('deleted_at', null)
      .maybeSingle();

    const inquiryDataToSave: any = {
      post_id: postId,
      product_id: productId,
      type: inquiryData.type || 'general',
      company_name: inquiryData.company_name || null,
      budget_min: inquiryData.budget_min || 0,
      budget_max: inquiryData.budget_max || 0,
      expected_start_at: inquiryData.expected_start_at || null,
      expected_end_at: inquiryData.expected_end_at || null,
      priority: inquiryData.priority || 'medium',
      inquiry_status: inquiryData.inquiry_status || 'pending',
      internal_notes: inquiryData.internal_notes || null,
    };

    if (existingInquiry) {
      // 업데이트
      const { error } = await supabase
        .from('product_inquiries')
        .update(inquiryDataToSave)
        .eq('post_id', postId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: existingInquiry.id };
    } else {
      // 새로 생성
      const { data, error } = await supabase
        .from('product_inquiries')
        .insert(inquiryDataToSave)
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * @deprecated saveProductInquiry를 사용하세요
 */
export async function savePostInquiry(
  productId: string,
  inquiryData: {
    subject: string;
    content: string;
    type?: 'general' | 'quote';
    company_name?: string | null;
    budget_min?: number;
    budget_max?: number;
    expected_start_at?: string | null;
    expected_end_at?: string | null;
    priority?: 'low' | 'medium' | 'high';
    inquiry_status?: 'pending' | 'approved' | 'answered' | 'rejected';
    internal_notes?: string | null;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  return { success: false, error: '이 함수는 더 이상 사용되지 않습니다. saveProductInquiry를 사용하세요.' };
}

/**
 * 제품 리뷰 정보 조회 (post_id 기반)
 */
export async function getProductReview(postId: string): Promise<{
  id: string;
  post_id: string;
  product_id: string;
  rating: number;
  pros: string;
  cons: string;
  purchase_date: string;
} | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, post_id, product_id, rating, pros, cons, purchase_date')
      .eq('post_id', postId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      post_id: data.post_id,
      product_id: data.product_id,
      rating: data.rating,
      pros: data.pros,
      cons: data.cons,
      purchase_date: data.purchase_date,
    };
  } catch (error) {
    console.error('리뷰 정보 조회 오류:', error);
    return null;
  }
}

/**
 * 제품의 리뷰 목록 조회 (product_id 기반)
 */
export async function getProductReviewsByProductId(productId: string): Promise<Array<{
  id: string;
  post_id: string;
  product_id: string;
  rating: number;
  pros: string;
  cons: string;
  purchase_date: string;
  created_at: string;
}>> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, post_id, product_id, rating, pros, cons, purchase_date, created_at')
      .eq('product_id', productId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      product_id: item.product_id,
      rating: item.rating,
      pros: item.pros,
      cons: item.cons,
      purchase_date: item.purchase_date,
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error('리뷰 목록 조회 오류:', error);
    return [];
  }
}

/**
 * @deprecated getProductReview를 사용하세요
 */
export async function getPostReview(postId: string): Promise<{
  product_id: string | null;
  product_name: string | null;
  rating: number;
  pros: string;
  cons: string;
  purchase_date: string;
} | null> {
  const review = await getProductReview(postId);
  if (!review) return null;

  return {
    product_id: review.product_id,
    product_name: null,
    rating: review.rating,
    pros: review.pros,
    cons: review.cons,
    purchase_date: review.purchase_date,
  };
}

/**
 * 제품 문의 정보 조회 (post_id 기반)
 */
export async function getProductInquiry(postId: string): Promise<{
  id: string;
  post_id: string;
  product_id: string;
  type: 'general' | 'quote';
  company_name: string | null;
  budget_min: number;
  budget_max: number;
  expected_start_at: string | null;
  expected_end_at: string | null;
  priority: 'low' | 'medium' | 'high';
  inquiry_status: 'pending' | 'approved' | 'answered' | 'rejected';
  internal_notes: string | null;
} | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('product_inquiries')
      .select('id, post_id, product_id, type, company_name, budget_min, budget_max, expected_start_at, expected_end_at, priority, inquiry_status, internal_notes')
      .eq('post_id', postId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      post_id: data.post_id,
      product_id: data.product_id,
      type: data.type,
      company_name: data.company_name,
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      expected_start_at: data.expected_start_at,
      expected_end_at: data.expected_end_at,
      priority: data.priority,
      inquiry_status: data.inquiry_status,
      internal_notes: data.internal_notes,
    };
  } catch (error) {
    console.error('문의 정보 조회 오류:', error);
    return null;
  }
}

/**
 * 제품의 문의 목록 조회 (product_id 기반)
 */
export async function getProductInquiriesByProductId(productId: string): Promise<Array<{
  id: string;
  post_id: string;
  product_id: string;
  type: 'general' | 'quote';
  company_name: string | null;
  budget_min: number;
  budget_max: number;
  expected_start_at: string | null;
  expected_end_at: string | null;
  priority: 'low' | 'medium' | 'high';
  inquiry_status: 'pending' | 'approved' | 'answered' | 'rejected';
  created_at: string;
}>> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('product_inquiries')
      .select('id, post_id, product_id, type, company_name, budget_min, budget_max, expected_start_at, expected_end_at, priority, inquiry_status, created_at')
      .eq('product_id', productId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      product_id: item.product_id,
      type: item.type,
      company_name: item.company_name,
      budget_min: item.budget_min,
      budget_max: item.budget_max,
      expected_start_at: item.expected_start_at,
      expected_end_at: item.expected_end_at,
      priority: item.priority,
      inquiry_status: item.inquiry_status,
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error('문의 목록 조회 오류:', error);
    return [];
  }
}

/**
 * @deprecated getProductInquiry를 사용하세요
 */
export async function getPostInquiry(postId: string): Promise<{
  type: 'general' | 'quote';
  product_id: string | null;
  product_name: string | null;
  company_name: string | null;
  subject: string | null;
  budget_min: number;
  budget_max: number;
  expected_start_at: string | null;
  expected_end_at: string | null;
  priority: 'low' | 'medium' | 'high';
  inquiry_status: 'pending' | 'approved' | 'answered' | 'rejected';
  internal_notes: string | null;
} | null> {
  const inquiry = await getProductInquiry(postId);
  if (!inquiry) return null;

  return {
    type: inquiry.type,
    product_id: inquiry.product_id,
    product_name: null,
    company_name: inquiry.company_name,
    subject: null,
    budget_min: inquiry.budget_min,
    budget_max: inquiry.budget_max,
    expected_start_at: inquiry.expected_start_at,
    expected_end_at: inquiry.expected_end_at,
    priority: inquiry.priority,
    inquiry_status: inquiry.inquiry_status,
    internal_notes: inquiry.internal_notes,
  };
}

/**
 * 사이트 설정 정보 조회 (프로젝트 전체의 일관된 설정)
 */
export async function getSiteSettings(): Promise<{
  id: string;
  prologue_default_title: string | null;
  prologue_default_description: string | null;
  contact_email: string | null;
  contact_address: string | null;
  contact_business_hours: string | null;
  contact_phone_primary: string | null;
  contact_phone_secondary: string | null;
  contact_fax: string | null;
  contact_map_url: string | null;
  contact_extra_json: string | null;
} | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('site_settings')
      .select('id, prologue_default_title, prologue_default_description, contact_email, contact_address, contact_business_hours, contact_phone_primary, contact_phone_secondary, contact_fax, contact_map_url, contact_extra_json').is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      prologue_default_title: data.prologue_default_title,
      prologue_default_description: data.prologue_default_description,
      contact_email: data.contact_email,
      contact_address: data.contact_address,
      contact_business_hours: data.contact_business_hours,
      contact_phone_primary: data.contact_phone_primary,
      contact_phone_secondary: data.contact_phone_secondary,
      contact_fax: data.contact_fax,
      contact_map_url: data.contact_map_url,
      contact_extra_json: data.contact_extra_json,
    };
  } catch (error) {
    console.error('사이트 설정 조회 오류:', error);
    return null;
  }
}

/**
 * 사이트 설정 저장/업데이트 (관리자용)
 */
export async function saveSiteSettings(
  settings: {
    prologue_default_title?: string | null;
    prologue_default_description?: string | null;
    contact_email?: string | null;
    contact_address?: string | null;
    contact_business_hours?: string | null;
    contact_phone_primary?: string | null;
    contact_phone_secondary?: string | null;
    contact_fax?: string | null;
    contact_map_url?: string | null;
    contact_extra_json?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 사용자 인증 상태 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    // 관리자 여부 확인
    const { data: adminData, error: adminError } = await supabase
      .from('administrators')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (adminError || !adminData) {
      return { success: false, error: '관리자 권한이 필요합니다.' };
    }

    // 기존 설정 확인
    const { data: existingSettings } = await supabase
      .from('site_settings')
      .select('id')
      .is('deleted_at', null)
      .maybeSingle();

    const settingsData: any = {};

    if (settings.prologue_default_title !== undefined) {
      settingsData.prologue_default_title = settings.prologue_default_title || null;
    }
    if (settings.prologue_default_description !== undefined) {
      settingsData.prologue_default_description = settings.prologue_default_description || null;
    }
    if (settings.contact_email !== undefined) {
      settingsData.contact_email = settings.contact_email || null;
    }
    if (settings.contact_address !== undefined) {
      settingsData.contact_address = settings.contact_address || null;
    }
    if (settings.contact_business_hours !== undefined) {
      settingsData.contact_business_hours = settings.contact_business_hours || null;
    }
    if (settings.contact_phone_primary !== undefined) {
      settingsData.contact_phone_primary = settings.contact_phone_primary || null;
    }
    if (settings.contact_phone_secondary !== undefined) {
      settingsData.contact_phone_secondary = settings.contact_phone_secondary || null;
    }
    if (settings.contact_fax !== undefined) {
      settingsData.contact_fax = settings.contact_fax || null;
    }
    if (settings.contact_map_url !== undefined) {
      settingsData.contact_map_url = settings.contact_map_url || null;
    }
    if (settings.contact_extra_json !== undefined) {
      settingsData.contact_extra_json = settings.contact_extra_json || null;
    }

    if (existingSettings) {
      // 업데이트
      const { error } = await supabase
        .from('site_settings')
        .update(settingsData)
        .eq('id', existingSettings.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('site_settings')
        .insert(settingsData);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


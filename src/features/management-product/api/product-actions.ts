'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import type { Product, ProductCategory, ProductInfo } from '@/src/entities/product/model/types';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/shared/lib/supabase-types';

/**
 * 제품 카테고리 목록 로드
 */
export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('display_order', { ascending: true }) as {
        data: ProductCategory[] | null;
        error: any;
      };

    if (error) {
      console.error('제품 카테고리 로드 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('제품 카테고리 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 제품 카테고리 저장
 */
export async function saveProductCategory(category: Partial<ProductCategory>): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    if (category.id) {
      // 업데이트
      const updateData: any = { title: category.title };
      if (category.display_order !== undefined) {
        updateData.display_order = category.display_order;
      }

      const { error, data } = await supabase
        .from('product_categories')
        .update(updateData)
        .eq('id', category.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      revalidatePath('/admin/sections/products/categories');

      return { success: true, id: data.id };
    } else {
      // 새로 생성 - display_order는 최대값 + 1로 설정
      const { data: maxOrderData } = await supabase
        .from('product_categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single() as { data: { display_order?: number } | null; error: any };

      const nextOrder = maxOrderData?.display_order !== undefined
        ? (maxOrderData.display_order + 1)
        : 0;

      const { error, data } = await supabase
        .from('product_categories')
        .insert({
          title: category.title || '',
          display_order: category.display_order !== undefined ? category.display_order : nextOrder
        } as any)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      revalidatePath('/admin/sections/products/categories');

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 제품 카테고리 순서 업데이트
 */
export async function updateProductCategoriesOrder(categories: { id: string; display_order: number }[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 배치 업데이트
    const updates = categories.map(cat =>
      supabase
        .from('product_categories')
        .update({ display_order: cat.display_order } as any)
        .eq('id', cat.id)
    );

    const results = await Promise.all(updates);

    const hasError = results.some(result => result.error);
    if (hasError) {
      const errorResult = results.find(result => result.error);
      return { success: false, error: errorResult?.error?.message || '순서 업데이트 중 오류가 발생했습니다.' };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/sections/products/categories');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 제품 카테고리 삭제
 */
export async function deleteProductCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/sections/products/categories');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 단일 제품 조회 (관리자용)
 */
export async function getProductUsingAdmin(id: string): Promise<Product | null> {
  const supabase = await createServerClient();
  return getProduct(supabase, id);
}
/**
 * 단일 제품 조회 (익명용)
 */
export async function getProductUsingAnonymous(id: string): Promise<Product | null> {
  const supabase = createAnonymousServerClient();
  return getProduct(supabase, id);
}

/**
 * 단일 제품 조회 (supabase 클라이언트 전달)
 */
export async function getProduct(supabase: SupabaseClient<Database>, id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle() as {
        data: Product | null;
        error: any;
      };

    if (error) {
      console.error('제품 조회 오류:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('제품 조회 중 예외 발생:', error);
    return null;
  }
}

/**
 * 제품 목록 로드 (관리자용)
 */
export async function getProductsUsingAdmin(): Promise<Product[]> {
  const supabase = await createServerClient();
  return getProducts(supabase);
}

/**
 * 제품 목록 로드 (익명용)
 */
export async function getProductsUsingAnonymous(): Promise<Product[]> {
  const supabase = createAnonymousServerClient();
  return getProducts(supabase);
}

/**
 * 제품 목록 로드 (supabase 클라이언트 전달)
 */
export async function getProducts(supabase: SupabaseClient<Database>): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false }) as {
        data: (Product & { product_categories: ProductCategory | null })[] | null;
        error: any;
      };

    if (error) {
      console.error('제품 로드 오류:', error);
      return [];
    }

    return data || []
  } catch (error) {
    console.error('제품 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 제품 목록 조회 (검색 및 페이지네이션 지원, 관리자용)
 */
export async function searchProductsUsingAdmin(
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Product[]; total: number; totalPages: number }> {
  const supabase = await createServerClient();
  return searchProducts(supabase, searchTerm, page, itemsPerPage, sortColumn, sortDirection);
}

/**
 * 제품 목록 조회 (검색 및 페이지네이션 지원, supabase 클라이언트 전달)
 */
export async function searchProducts(
  supabase: SupabaseClient<Database>,
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  sortColumn?: string | null,
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<{ data: Product[]; total: number; totalPages: number }> {
  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 전체 개수 조회
    const { count, error: countError } = await query;

    if (countError) {
      console.error('제품 개수 조회 오류:', countError);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // 페이지네이션 적용
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let dataQuery = supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .range(from, to);

    // 검색어가 있으면 제목과 내용에서 검색
    if (searchTerm.trim()) {
      dataQuery = dataQuery.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,content_summary.ilike.%${searchTerm}%`);
    }

    // 정렬 적용
    if (sortColumn) {
      // 컬럼 ID를 DB 컬럼명으로 매핑
      const columnMapping: Record<string, string> = {
        'title': 'title',
        'status': 'status',
        'created_at': 'created_at',
        'category': 'category_id', // 카테고리는 category_id로 정렬
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
      data: Product[] | null;
      error: any;
    };

    if (error) {
      console.error('제품 로드 오류:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    return {
      data: data || [],
      total,
      totalPages
    };
  } catch (error) {
    console.error('제품 검색 중 예외 발생:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * 제품 저장
 */
export async function saveProduct(product: Omit<Product, 'id'> & { id?: string | null }): Promise<{ success: boolean; error?: string; id?: string }> {
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

    console.log({ adminData })

    if (adminError || !adminData) {
      return { success: false, error: '관리자 권한이 필요합니다.' };
    }

    const productData: any = {
      title: product.title,
      content: product.content,
      content_summary: product.content_summary || '',
      category_id: product.category_id || null,
      specs: product.specs || null,
      status: product.status,
      thumbnail_url: product.thumbnail_url || null,
      extra_json: product.extra_json || null,
    };

    // console.log({ productData })

    if (product.id) {
      // 업데이트
      const { error, data } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      revalidatePath('/admin/sections/products');
      revalidatePath(`/admin/sections/products/${product.id}`);

      return { success: true, id: data.id };
    } else {
      // 새로 생성
      const { error, data } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('제품 생성 오류:', error);
        return { success: false, error: error.message };
      }

      // 화면 업데이트를 위한 캐시 무효화
      revalidatePath('/admin/sections/products');

      return { success: true, id: data.id };
    }
  } catch (error: any) {
    console.error('제품 저장 중 예외 발생:', error);
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 제품 삭제 (soft delete)
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/sections/products');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}

/**
 * 제품소개 정보 로드
 * 공개 데이터이므로 익명 클라이언트 사용
 */
export async function getProductInfo(): Promise<ProductInfo | null> {
  try {
    const supabase = createAnonymousServerClient();
    const { data, error } = await supabase
      .from('product_info')
      .select('*')
      .limit(1)
      .maybeSingle() as {
        data: {
          id: string;
          introduction: string | null;
          review_board_id: string | null;
          quote_board_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        } | null;
        error: any;
      };

    if (error) {
      console.error('제품소개 정보 로드 오류:', error);
      return {
        id: '',
        introduction: '',
        review_board_id: null,
        quote_board_id: null,
      };
    }

    return {
      id: data?.id || '',
      introduction: data?.introduction || '',
      review_board_id: data?.review_board_id || null,
      quote_board_id: data?.quote_board_id || null,
      created_at: data?.created_at || null,
      updated_at: data?.updated_at || null,
    };
  } catch (error) {
    console.error('제품소개 정보 로드 중 예외 발생:', error);
    return {
      id: '',
      introduction: '',
      review_board_id: null,
      quote_board_id: null,
    };
  }
}

/**
 * 제품소개 정보 저장
 */
export async function saveProductInfo(productInfo: Partial<ProductInfo>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // 기존 정보 확인
    const { data: existingInfo } = await supabase
      .from('product_info')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: any };

    const updateData: any = {};

    if (productInfo.introduction !== undefined) {
      updateData.introduction = productInfo.introduction || '';
    }

    if (productInfo.review_board_id !== undefined) {
      updateData.review_board_id = productInfo.review_board_id || null;
    }

    if (productInfo.quote_board_id !== undefined) {
      updateData.quote_board_id = productInfo.quote_board_id || null;
    }

    if (existingInfo) {
      // 업데이트
      const { error } = await supabase
        .from('product_info')
        .update(updateData)
        .eq('id', existingInfo.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // 새로 생성
      const { error } = await supabase
        .from('product_info')
        .insert(updateData);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    // 화면 업데이트를 위한 캐시 무효화
    revalidatePath('/admin/sections/products');
    revalidatePath('/admin/sections/products/board-settings');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


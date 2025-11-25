'use server';

import { createServerClient } from '@/src/shared/lib/supabase/server';
import { createAnonymousServerClient } from '@/src/shared/lib/supabase/anonymous';
import type { Product, ProductCategory } from '@/src/entities/product/model/types';
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
      revalidatePath('/admin/info/products/categories');

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
      revalidatePath('/admin/info/products/categories');

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
    revalidatePath('/admin/info/products/categories');

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
    revalidatePath('/admin/info/products/categories');

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
      revalidatePath('/admin/info/products');
      revalidatePath(`/admin/info/products/${product.id}`);

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
      revalidatePath('/admin/info/products');

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
    revalidatePath('/admin/info/products');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || '알 수 없는 오류' };
  }
}


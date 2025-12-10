"use server"

import { createSecretClient } from '@/src/shared/lib/supabase/service';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * 관리자 계정 존재 여부 확인
 * Secret Key를 사용하여 RLS 정책을 우회합니다.
 * administrators 테이블을 조회하여 확인합니다.
 */
export async function checkAdminExists(): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    // administrators 테이블에서 관리자 계정이 있는지 확인
    const { count, error } = await supabase
      .from('administrators')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (error) {
      console.error('관리자 계정 확인 오류:', error);
      return false;
    }

    return (count ?? 0) > 0;
  } catch (error) {
    console.error('관리자 계정 확인 중 오류 발생:', error);
    return false;
  }
}

/**
 * 관리자 계정 생성
 * Secret Key를 사용하여 RLS 정책을 우회합니다.
 */
export async function createAdminAccount(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 먼저 관리자 계정이 이미 존재하는지 확인
    const adminExists = await checkAdminExists();
    if (adminExists) {
      return { success: false, error: '관리자 계정이 이미 존재합니다.' };
    }

    const { env } = await getCloudflareContext({ async: true });
    // 서비스 롤 클라이언트로 회원가입 (auth.users에 사용자 생성)
    const supabase = await createSecretClient(env.SUPABASE_SECRET_KEY);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 인증 없이 바로 활성화
      user_metadata: {
        name,
        verified: true,
        // email_verified: true,
      },
    });

    if (authError) {
      return {
        success: false,
        error: authError.message || '관리자 계정 생성에 실패했습니다.'
      };
    }

    if (!authData.user) {
      return { success: false, error: '관리자 계정 생성에 실패했습니다.' };
    }

    // profiles 테이블은 트리거(handle_new_user)에 의해 자동 생성됨
    // 트리거가 auth.users에 새 사용자가 생성될 때 자동으로 profiles 레코드를 생성합니다
    // 관리자의 경우 status를 'approved'로 업데이트해야 할 수 있음
    // 트리거가 생성한 후 잠시 대기 후 업데이트
    await new Promise(resolve => setTimeout(resolve, 500));

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        // status: 'approved', // 관리자는 바로 승인 상태
        name: name,
        email: email,
      })
      .eq('id', authData.user.id);

    if (profileUpdateError) {
      console.error('프로필 업데이트 오류:', profileUpdateError);
      // 프로필 업데이트 실패해도 계속 진행
    }

    // administrators 테이블에 관리자 레코드 생성
    const { error: adminError } = await supabase
      .from('administrators')
      .insert({
        id: authData.user.id,
        role: 'system', // 기본값: system 관리자
      });

    if (adminError) {
      console.error('관리자 레코드 생성 오류:', adminError);
      return {
        success: false,
        error: '관리자 레코드 생성에 실패했습니다: ' + adminError.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('관리자 계정 생성 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '관리자 계정 생성 중 오류가 발생했습니다.'
    };
  }
}


import { supabase } from '@/src/shared/lib/supabase/client';

/**
 * 비밀번호 변경
 * @param email 사용자 이메일
 * @param currentPassword 현재 비밀번호
 * @param newPassword 새 비밀번호
 */
export async function updatePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // 현재 비밀번호 확인
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('현재 비밀번호가 올바르지 않습니다.');
  }

  // 새 비밀번호로 변경
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error('비밀번호 변경 실패: ' + updateError.message);
  }
}


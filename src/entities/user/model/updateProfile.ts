// import { supabase } from '@/src/shared/lib/supabase/client';
import type { Profile } from './types';
import { createBrowserClient } from '@/src/shared/lib/supabase/client';
import { getCurrentISOString } from '@/src/shared/lib/utils';

/**
 * 프로필 정보 업데이트
 * @param userId 사용자 ID
 * @param data 업데이트할 프로필 데이터
 * @returns 업데이트된 프로필 정보
 */
export async function updateProfile(
  userId: string,
  data: { name: string }
): Promise<Profile> {
  const supabase = createBrowserClient();
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      updated_at: getCurrentISOString(),
    })
    .eq('id', userId)
    .select('id, name, email, last_login, phone, created_at, updated_at')
    .single<Profile>();

  if (error) {
    throw new Error('프로필 업데이트 실패: ' + error.message);
  }

  if (!updatedProfile) {
    throw new Error('프로필 업데이트 실패: 업데이트된 데이터를 가져올 수 없습니다.');
  }

  return updatedProfile;
}


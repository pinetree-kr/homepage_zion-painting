-- ============================================================================
-- 관리자 계정 자동 생성 트리거
-- auth.users 생성 시 metadata의 role이 'system'이면 administrators 레코드 자동 생성
-- ============================================================================

-- handle_new_user 트리거 함수 수정: 관리자 계정 자동 생성 추가
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  signup_provider TEXT;
  user_phone TEXT;
  is_verified BOOLEAN;
  user_role TEXT;
  invite_pending BOOLEAN;
BEGIN
  -- provider 정보 추출
  signup_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  
  -- phone 정보 추출
  user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NULL
  );
  
  -- verified 상태 확인 (email_verified 또는 phone_verified)
  is_verified := COALESCE(
    (NEW.raw_user_meta_data->>'email_verified')::boolean,
    (NEW.raw_user_meta_data->>'phone_verified')::boolean,
    (NEW.raw_user_meta_data->>'verified')::boolean,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.confirmed_at IS NOT NULL,
    false
  );

  -- role 정보 추출 (user_metadata에서)
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    NULL
  );

  -- invite_pending 정보 추출 (초대 중인지 확인)
  invite_pending := COALESCE(
    (NEW.raw_user_meta_data->>'invite_pending')::boolean,
    false
  );
  
  -- 프로필 생성 시 metadata에 정보 저장
  INSERT INTO public.profiles (id, name, email, metadata)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    jsonb_build_object(
      'last_login', NULL,
      'phone', user_phone,
      'verified', is_verified,
      'signup_provider', signup_provider
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    metadata = COALESCE(profiles.metadata, '{}'::jsonb) || jsonb_build_object(
      'signup_provider', signup_provider,
      'phone', COALESCE(user_phone, profiles.metadata->>'phone'),
      'verified', is_verified
    );
  
  -- role이 'system'이면 administrators 테이블에 레코드 추가
  IF user_role = 'system' THEN
    INSERT INTO public.administrators (id, role, metadata)
    VALUES (
      NEW.id, 
      'system',
      CASE 
        WHEN invite_pending THEN jsonb_build_object('verified', false)
        ELSE jsonb_build_object('verified', true)
      END
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      metadata = COALESCE(administrators.metadata, '{}'::jsonb) || CASE 
        WHEN invite_pending THEN jsonb_build_object('verified', false)
        ELSE COALESCE(administrators.metadata, '{}'::jsonb) || jsonb_build_object('verified', true)
      END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 오류 발생 시에도 사용자 생성은 계속 진행
    RAISE WARNING 'handle_new_user 트리거 오류: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;


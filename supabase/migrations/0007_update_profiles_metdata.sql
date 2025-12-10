-- 1. handle_verified_user 트리거 함수 추가: 인증 시 정보를 metadata에 업데이트
CREATE OR REPLACE FUNCTION handle_verified_user()
RETURNS TRIGGER AS $$
DECLARE
  is_verified BOOLEAN;
BEGIN
  -- verified 상태 확인 (email_verified 또는 phone_verified)
  is_verified := COALESCE(
    (NEW.raw_user_meta_data->>'email_verified')::boolean,
    (NEW.raw_user_meta_data->>'phone_verified')::boolean,
    (NEW.raw_user_meta_data->>'verified')::boolean,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.confirmed_at IS NOT NULL,
    false
  );
    
  -- 프로필 생성 시 metadata에 정보 저장
  UPDATE public.profiles
  SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'verified', is_verified
  ) WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 2. handle_verified_user 트리거 생성
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_verified_user();

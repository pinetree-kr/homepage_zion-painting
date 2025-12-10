-- ============================================================================
-- profiles 테이블에 metadata JSONB 컬럼 추가
-- ============================================================================

-- 1. profiles 테이블에 metadata JSONB 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. metadata JSONB 인덱스 생성 (GIN 인덱스로 JSONB 필드 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_metadata ON profiles USING GIN (metadata);

-- 3. 기존 데이터 마이그레이션: last_login과 phone을 metadata로 이동
-- 기존 metadata가 있으면 병합하고, 없으면 새로 생성
UPDATE profiles
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'last_login', COALESCE(metadata->>'last_login', last_login::text),
  'phone', COALESCE(metadata->>'phone', phone),
  'verified', COALESCE((metadata->>'verified')::boolean, false),
  'signup_provider', COALESCE(metadata->>'signup_provider', 'email')
)
WHERE metadata IS NULL 
   OR metadata = '{}'::jsonb 
   OR metadata->>'last_login' IS NULL 
   OR metadata->>'phone' IS NULL 
   OR metadata->>'signup_provider' IS NULL;

-- 4. handle_new_user 트리거 함수 수정: 가입 시 provider 정보를 metadata에 저장
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  signup_provider TEXT;
  user_phone TEXT;
  is_verified BOOLEAN;
BEGIN
  -- provider 정보 추출
  -- Supabase는 auth.identities 테이블에 provider 정보를 저장합니다
  -- 트리거 실행 시점에 identities가 아직 생성되지 않았을 수 있으므로
  -- 기본값으로 'email'을 설정하고, 나중에 애플리케이션에서 업데이트할 수 있습니다
  BEGIN
    SELECT provider INTO signup_provider
    FROM auth.identities
    WHERE user_id = NEW.id
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- provider를 찾지 못한 경우 기본값 사용
    IF signup_provider IS NULL THEN
      signup_provider := 'email';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- auth.identities 접근 실패 시 기본값 사용
      signup_provider := 'email';
  END;
  
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;

-- 5. 기존 컬럼 제거 (데이터 마이그레이션 후)
-- last_login과 phone 컬럼을 제거합니다 (metadata로 이동 완료)
ALTER TABLE profiles DROP COLUMN IF EXISTS last_login;
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- 6. 주석 추가
COMMENT ON COLUMN profiles.metadata IS '사용자 메타데이터 (last_login, verified, phone, signup_provider 등)';
-- COMMENT ON COLUMN profiles.metadata->>'last_login' IS '마지막 로그인 시간 (ISO 8601 형식)';
-- COMMENT ON COLUMN profiles.metadata->>'verified' IS '이메일/전화번호 인증 여부';
-- COMMENT ON COLUMN profiles.metadata->>'phone' IS '전화번호';
-- COMMENT ON COLUMN profiles.metadata->>'signup_provider' IS '가입 경로 (email, kakao, google 등)';


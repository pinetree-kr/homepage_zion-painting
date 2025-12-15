-- ============================================================================
-- administrators 테이블에 metadata 컬럼 추가
-- 초대 상태를 administrators.metadata.verified로 관리
-- ============================================================================

-- 1. administrators 테이블에 metadata JSONB 컬럼 추가
ALTER TABLE administrators 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. metadata JSONB 인덱스 생성 (GIN 인덱스로 JSONB 필드 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_administrators_metadata ON administrators USING GIN (metadata);

-- 3. 기존 관리자 레코드에 verified: true 설정 (이미 활성화된 관리자)
UPDATE administrators
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('verified', true)
WHERE metadata IS NULL 
   OR metadata = '{}'::jsonb
   OR (metadata->>'verified') IS NULL;

-- 4. 주석 추가
COMMENT ON COLUMN administrators.metadata IS '관리자 메타데이터 (verified: 초대 인증 완료 여부)';

-- ============================================================================
-- handle_verified_user 트리거 함수 수정: 관리자 인증 시 administrators.metadata.verified 업데이트
-- ============================================================================

-- handle_verified_user 트리거 함수 수정: 관리자 인증 시 administrators.metadata.verified도 업데이트
CREATE OR REPLACE FUNCTION handle_verified_user()
RETURNS TRIGGER AS $$
DECLARE
  is_verified BOOLEAN;
  is_admin BOOLEAN;
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
    
  -- 프로필 metadata에 verified 정보 저장
  UPDATE public.profiles
  SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'verified', is_verified
  ) WHERE id = NEW.id;

  -- 관리자인 경우 administrators.metadata.verified도 업데이트
  SELECT EXISTS (
    SELECT 1 FROM public.administrators 
    WHERE administrators.id = NEW.id
    AND administrators.deleted_at IS NULL
  ) INTO is_admin;

  IF is_admin AND is_verified THEN
    UPDATE public.administrators
    SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'verified', true
    )
    WHERE id = NEW.id
    AND deleted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,public;


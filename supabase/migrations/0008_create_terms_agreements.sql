-- ============================================================================
-- 약관 동의 테이블 생성
-- ============================================================================

-- 약관 동의 테이블 생성
CREATE TABLE IF NOT EXISTS terms_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  agreement_type VARCHAR(50) NOT NULL,  -- 'terms' 또는 'privacy'
  version VARCHAR(50) NOT NULL,         -- 약관 버전 (예: '20241211')
  agreed BOOLEAN NOT NULL DEFAULT true,
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_terms_agreements_user_id ON terms_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_type ON terms_agreements(agreement_type);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_version ON terms_agreements(version);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_user_type ON terms_agreements(user_id, agreement_type);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_agreed_at ON terms_agreements(agreed_at DESC);

-- 사용자별, 약관 타입별, 버전별로 최신 동의만 조회하기 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_terms_agreements_user_type_version ON terms_agreements(user_id, agreement_type, version DESC);

-- 주석 추가
COMMENT ON TABLE terms_agreements IS '사용자의 약관 동의 이력을 기록하는 테이블';
COMMENT ON COLUMN terms_agreements.agreement_type IS '약관 타입: terms(이용약관) 또는 privacy(개인정보 수집 및 이용)';
COMMENT ON COLUMN terms_agreements.version IS '약관 버전 (YYYYMMDD 형식, 예: 20241211)';
COMMENT ON COLUMN terms_agreements.agreed IS '동의 여부 (true: 동의, false: 동의 철회)';
COMMENT ON COLUMN terms_agreements.agreed_at IS '동의 또는 동의 철회 시점';

-- ============================================================================
-- RLS (Row Level Security) 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE terms_agreements ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 약관 동의 이력만 조회 가능
CREATE POLICY "Users can view own terms agreements"
  ON terms_agreements
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- 사용자는 자신의 약관 동의를 기록할 수 있음
CREATE POLICY "Users can create own terms agreements"
  ON terms_agreements
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- 관리자는 모든 약관 동의 이력을 조회 가능
CREATE POLICY "Admins can view all terms agreements"
  ON terms_agreements
  FOR SELECT
  USING (
    is_admin(auth.uid())
  );


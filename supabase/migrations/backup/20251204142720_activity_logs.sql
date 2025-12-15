-- ============================================================================
-- 활동 로그 테이블 생성
-- ============================================================================

-- 1. ENUM 타입 생성
CREATE TYPE log_type AS ENUM (
  'USER_SIGNUP',              -- 사용자 가입
  'ADMIN_SIGNUP',             -- 관리자 가입
  'LOGIN_FAILED',             -- 로그인 실패
  'ADMIN_LOGIN',              -- 관리자 로그인
  'SECTION_SETTING_CHANGE',   -- 섹션 설정 변경
  'BOARD_CREATE',             -- 게시판 생성
  'BOARD_UPDATE',             -- 게시판 수정
  'BOARD_DELETE',             -- 게시판 삭제
  'POST_CREATE',              -- 게시글 작성
  'POST_UPDATE',              -- 게시글 수정
  'POST_DELETE',              -- 게시글 삭제
  'POST_ANSWER',              -- 관리자 답변
  'ERROR'                     -- 오류 로그
);

-- 2. 활동 로그 테이블 생성
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 사용자 정보
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,  -- 사용자 이름 (user_id가 NULL일 수 있으므로 별도 저장)
  
  -- 로그 정보
  log_type log_type NOT NULL,
  action VARCHAR(255) NOT NULL,     -- 작업명 (예: "관리자 로그인", "게시판 생성")
  details TEXT,                     -- 상세 설명
  
  -- 메타데이터 (JSONB로 유연하게 저장)
  metadata JSONB DEFAULT '{}'::jsonb,
  -- metadata 구조 예시:
  -- {
  --   "sectionName": "회사정보",
  --   "boardName": "Q&A",
  --   "postId": "uuid-here",
  --   "errorMessage": "파일 크기가 5MB를 초과합니다.",
  --   "beforeValue": "기존 설정값",
  --   "afterValue": "새로운 설정값"
  -- }
  
  -- 네트워크 정보
  ip_address INET,                  -- IP 주소 (IPv4/IPv6 지원)
  user_agent TEXT,                  -- User-Agent (선택적)
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. 인덱스 생성
-- 로그 타입별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_activity_logs_log_type ON activity_logs(log_type);

-- 사용자별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id) WHERE user_id IS NOT NULL;

-- 시간별 조회 최적화 (최신순 조회)
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 복합 인덱스: 로그 타입 + 시간 (자주 사용되는 쿼리 패턴)
CREATE INDEX IF NOT EXISTS idx_activity_logs_type_created_at ON activity_logs(log_type, created_at DESC);

-- IP 주소별 조회 (보안 분석용)
CREATE INDEX IF NOT EXISTS idx_activity_logs_ip_address ON activity_logs(ip_address) WHERE ip_address IS NOT NULL;

-- 메타데이터 JSONB 인덱스 (특정 필드 검색용)
-- CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata_post_id ON activity_logs USING GIN ((metadata->>'postId')) WHERE metadata->>'postId' IS NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata_board_name ON activity_logs USING GIN ((metadata->>'boardName')) WHERE metadata->>'boardName' IS NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata_section_name ON activity_logs USING GIN ((metadata->>'sectionName')) WHERE metadata->>'sectionName' IS NOT NULL;

-- 4. RLS (Row Level Security) 활성화
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 생성
-- 모든 사용자는 자신의 로그만 조회 가능
CREATE POLICY "Users can view their own logs"
  ON activity_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- 관리자는 모든 로그 조회 가능
CREATE POLICY "Admins can view all logs"
  ON activity_logs
  FOR SELECT
  USING (
    is_admin(auth.uid())
  );

-- 시스템은 모든 로그 삽입 가능 (서버 사이드에서 로그 기록)
CREATE POLICY "System can insert all logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (true);

-- 관리자만 로그 삭제 가능 (로그 보관 정책에 따라)
CREATE POLICY "Admins can delete logs"
  ON activity_logs
  FOR DELETE
  USING (
    is_admin(auth.uid())
  );

-- 6. 자동 파티셔닝을 위한 함수 (선택적 - 대용량 데이터 처리용)
-- 월별 파티셔닝을 원하는 경우 사용
-- CREATE OR REPLACE FUNCTION create_activity_logs_partition(partition_date DATE)
-- RETURNS VOID AS $$
-- DECLARE
--   partition_name TEXT;
--   start_date DATE;
--   end_date DATE;
-- BEGIN
--   partition_name := 'activity_logs_' || to_char(partition_date, 'YYYY_MM');
--   start_date := date_trunc('month', partition_date);
--   end_date := start_date + interval '1 month';
--   
--   EXECUTE format('
--     CREATE TABLE IF NOT EXISTS %I PARTITION OF activity_logs
--     FOR VALUES FROM (%L) TO (%L)
--   ', partition_name, start_date, end_date);
-- END;
-- $$ LANGUAGE plpgsql;

-- 7. 로그 자동 정리 함수 (선택적 - 오래된 로그 삭제)
-- 90일 이상 된 로그를 자동으로 삭제하는 함수
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 90일 이상 된 로그 삭제 (기간은 필요에 따라 조정)
  DELETE FROM activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 8. 주석 추가
COMMENT ON TABLE activity_logs IS '시스템의 모든 활동과 오류를 기록하는 로그 테이블';
COMMENT ON COLUMN activity_logs.log_type IS '로그 타입 (사용자 가입, 관리자 로그인, 오류 등)';
COMMENT ON COLUMN activity_logs.metadata IS '추가 정보를 저장하는 JSONB 필드 (섹션명, 게시판명, 게시글 ID, 오류 메시지, 변경 전/후 값 등)';
COMMENT ON COLUMN activity_logs.ip_address IS '요청자의 IP 주소 (IPv4/IPv6 지원)';
COMMENT ON COLUMN activity_logs.user_agent IS '요청자의 User-Agent 정보';


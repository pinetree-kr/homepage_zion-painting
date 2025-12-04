-- 게시판 권한 매트릭스 스키마 추가
-- visible_type, app_role enum 타입 및 board_policies 테이블 생성

-- ============================================================================
-- 1. ENUM 타입 생성
-- ============================================================================

-- 게시판 공개 범위 타입
CREATE TYPE visible_type AS ENUM ('public', 'member', 'owner');

-- 애플리케이션 역할 타입
CREATE TYPE app_role AS ENUM ('member', 'admin');

-- ============================================================================
-- 2. boards 테이블에 visibility 컬럼 추가
-- ============================================================================

ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS visibility visible_type NOT NULL DEFAULT 'public';

COMMENT ON COLUMN boards.visibility IS '공개 범위: public(공개), member(회원용), owner(1:1 게시판)';

-- 기존 데이터 마이그레이션: is_public이 TRUE면 'public', FALSE면 'member'로 설정
UPDATE boards 
SET visibility = CASE 
  WHEN is_public = TRUE THEN 'public'::visible_type
  ELSE 'member'::visible_type
END
WHERE visibility IS NULL OR visibility = 'public'::visible_type;

-- ============================================================================
-- 3. board_policies 테이블 생성 (권한 매트릭스)
-- ============================================================================

CREATE TABLE IF NOT EXISTS board_policies (
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  post_list BOOLEAN NOT NULL DEFAULT TRUE, -- 게시글 목록 접근 권한
  post_create BOOLEAN NOT NULL DEFAULT TRUE, -- 글 작성권한
  post_read BOOLEAN NOT NULL DEFAULT TRUE, -- 글 읽기권한
  post_edit BOOLEAN NOT NULL DEFAULT TRUE, -- 글 수정권한 (member는 자기것만)
  post_delete BOOLEAN NOT NULL DEFAULT TRUE, -- 글 삭제권한 (member는 자기것만)
  cmt_create BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 작성권한
  cmt_read BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 읽기권한
  cmt_edit BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 수정권한 (member는 자기것만)
  cmt_delete BOOLEAN NOT NULL DEFAULT TRUE, -- 댓글 삭제권한 (member는 자기것만)
  file_upload BOOLEAN NOT NULL DEFAULT TRUE, -- 파일 업로드 권한
  file_download BOOLEAN NOT NULL DEFAULT TRUE, -- 파일 다운로드 권한
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (board_id, role)
);

-- UNIQUE 인덱스 제거 (PK가 이미 유일성 보장)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_board_policies_board_role 
-- ON board_policies(board_id, role);

-- 인덱스 추가 (PK에 board_id가 포함되어 있으므로 board_id 인덱스는 선택적)
-- CREATE INDEX IF NOT EXISTS idx_board_policies_board_id 
-- ON board_policies(board_id);

-- role로 검색할 때를 위한 인덱스 (선택적)
CREATE INDEX IF NOT EXISTS idx_board_policies_role 
ON board_policies(role);

-- ============================================================================
-- 4. board_policies 테이블에 updated_at 트리거 추가
-- ============================================================================

CREATE TRIGGER update_board_policies_updated_at 
BEFORE UPDATE ON board_policies
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();


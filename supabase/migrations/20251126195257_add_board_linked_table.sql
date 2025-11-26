-- boards 테이블에 연결 테이블 필드 추가
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS linked_table_name VARCHAR(80) DEFAULT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_boards_linked_table_name ON boards(linked_table_name) WHERE linked_table_name IS NOT NULL;

-- 리뷰와 견적문의 게시판에 products 연결 설정
UPDATE boards 
SET linked_table_name = 'products' 
WHERE code IN ('reviews', 'quotes');

-- 동적으로 연결된 테이블의 레코드를 조회하는 함수
CREATE OR REPLACE FUNCTION get_linked_table_records(
  table_name TEXT,
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  title TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 동적 SQL 실행
  RETURN QUERY EXECUTE format(
    'SELECT id::UUID, title::TEXT FROM %I WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT %s',
    table_name,
    limit_count
  );
END;
$$;

-- 특정 게시판의 연결된 테이블 레코드 조회 함수
CREATE OR REPLACE FUNCTION get_board_linked_records(
  board_code_param VARCHAR(80),
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  linked_table TEXT;
BEGIN
  -- boards에서 linked_table_name 조회
  SELECT linked_table_name INTO linked_table
  FROM boards
  WHERE code = board_code_param
    AND deleted_at IS NULL;
  
  -- 연결된 테이블이 없으면 빈 결과 반환
  IF linked_table IS NULL THEN
    RETURN;
  END IF;
  
  -- 동적 SQL로 레코드 조회
  RETURN QUERY EXECUTE format(
    'SELECT id::UUID, title::TEXT FROM %I WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT %s',
    linked_table,
    limit_count
  );
END;
$$;

-- updated_at 트리거 추가 (boards 테이블)
DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


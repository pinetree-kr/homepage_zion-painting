-- ============================================================================
-- product_info 테이블 생성 및 site_settings 컬럼 리네임
-- ============================================================================

-- 1. product_info 테이블 생성
CREATE TABLE IF NOT EXISTS product_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction TEXT,
  review_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  quote_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- product_info는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS product_info_single_row ON product_info ((1));

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_info_review_board_id ON product_info(review_board_id) WHERE review_board_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_info_quote_board_id ON product_info(quote_board_id) WHERE quote_board_id IS NOT NULL;

-- 5. product_info updated_at 트리거 추가
DROP TRIGGER IF EXISTS update_product_info_updated_at ON product_info;

CREATE TRIGGER update_product_info_updated_at BEFORE UPDATE ON product_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. product_info RLS 활성화
ALTER TABLE product_info ENABLE ROW LEVEL SECURITY;

-- 7. product_info RLS 정책 생성
DROP POLICY IF EXISTS "Public read access for product_info" ON product_info;
DROP POLICY IF EXISTS "Admin write access for product_info" ON product_info;
DROP POLICY IF EXISTS "Admin update access for product_info" ON product_info;
DROP POLICY IF EXISTS "Admin delete access for product_info" ON product_info;

CREATE POLICY "Public read access for product_info" ON product_info
  FOR SELECT USING (true);

CREATE POLICY "Admin write access for product_info" ON product_info
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for product_info" ON product_info
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for product_info" ON product_info
  FOR DELETE USING (is_admin(auth.uid()));


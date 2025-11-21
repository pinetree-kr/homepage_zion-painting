-- 사업소개 스키마 변경 마이그레이션

-- 1. business_info 테이블 생성 (회사소개와 유사한 구조)
CREATE TABLE IF NOT EXISTS business_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction TEXT,
  areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- business_info는 단일 레코드만 유지
CREATE UNIQUE INDEX IF NOT EXISTS business_info_single_row ON business_info ((1));

-- 2. business_categories 테이블 생성 (적용산업)
CREATE TABLE IF NOT EXISTS business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_categories_title ON business_categories(title);

-- 3. business_achievements 테이블 수정
-- 기존 category VARCHAR(100) 컬럼을 제거하고 FK로 변경

-- 먼저 기존 인덱스 제거
DROP INDEX IF EXISTS idx_business_achievements_category;

-- 기존 category 컬럼을 임시로 백업 (category_backup)
ALTER TABLE business_achievements 
  ADD COLUMN IF NOT EXISTS category_backup VARCHAR(100);

-- 기존 category 값을 백업
UPDATE business_achievements 
SET category_backup = category 
WHERE category IS NOT NULL;

-- 기존 category 컬럼 제거
ALTER TABLE business_achievements 
  DROP COLUMN IF EXISTS category;

-- 새로운 category_id 컬럼 추가 (FK)
ALTER TABLE business_achievements 
  ADD COLUMN category_id UUID REFERENCES business_categories(id) ON DELETE SET NULL;

-- category_id 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_business_achievements_category_id ON business_achievements(category_id);

-- updated_at 트리거 추가
CREATE TRIGGER update_business_info_updated_at BEFORE UPDATE ON business_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_categories_updated_at BEFORE UPDATE ON business_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Public read access for business_info" ON business_info
  FOR SELECT USING (true);

CREATE POLICY "Public read access for business_categories" ON business_categories
  FOR SELECT USING (true);

-- 관리자 쓰기/수정/삭제 정책
CREATE POLICY "Admin write access for business_info" ON business_info
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_info" ON business_info
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_info" ON business_info
  FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admin write access for business_categories" ON business_categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin update access for business_categories" ON business_categories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin delete access for business_categories" ON business_categories
  FOR DELETE USING (is_admin(auth.uid()));


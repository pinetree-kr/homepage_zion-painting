-- business_categories 테이블에 display_order 필드 추가

-- display_order 컬럼 추가 (기본값 0)
ALTER TABLE business_categories 
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- display_order 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_business_categories_display_order ON business_categories(display_order);

-- 기존 데이터에 display_order 값 설정 (title 기준으로 정렬하여 순서 부여)
UPDATE business_categories
SET display_order = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY title) as row_number
  FROM business_categories
) AS subquery
WHERE business_categories.id = subquery.id;


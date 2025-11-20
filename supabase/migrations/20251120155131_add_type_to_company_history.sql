-- 회사 연혁 테이블에 type 컬럼 추가
ALTER TABLE company_history 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'business' 
CHECK (type IN ('business', 'certification'));

-- 기존 데이터는 모두 'business'로 설정됨 (DEFAULT 값)
-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_company_history_type ON company_history(type);


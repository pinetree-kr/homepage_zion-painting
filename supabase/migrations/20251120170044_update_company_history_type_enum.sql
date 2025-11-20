-- 회사 연혁 테이블의 type 컬럼 enum 값 변경
-- 기존 데이터 변환: 'business' -> 'biz', 'certification' -> 'cert'

-- 1. 기존 CHECK 제약 조건 제거
ALTER TABLE company_history 
DROP CONSTRAINT IF EXISTS company_history_type_check;

-- 2. 기존 데이터 변환
UPDATE company_history 
SET type = 'biz' 
WHERE type = 'business';

UPDATE company_history 
SET type = 'cert' 
WHERE type = 'certification';

-- 3. 새로운 CHECK 제약 조건 추가
ALTER TABLE company_history 
ADD CONSTRAINT company_history_type_check 
CHECK (type IN ('biz', 'cert'));

-- 4. DEFAULT 값 변경
ALTER TABLE company_history 
ALTER COLUMN type SET DEFAULT 'biz';


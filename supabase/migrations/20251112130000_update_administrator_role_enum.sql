-- 관리자 권한(role) enum 변경: 'system_admin' -> 'system', 'content_admin' -> 'contents'

-- 1. 기존 데이터 업데이트
UPDATE administrators 
SET role = 'system' 
WHERE role = 'system_admin';

UPDATE administrators 
SET role = 'contents' 
WHERE role = 'content_admin';

-- 2. CHECK 제약조건 제거 및 재생성
ALTER TABLE administrators 
DROP CONSTRAINT IF EXISTS administrators_role_check;

ALTER TABLE administrators 
ADD CONSTRAINT administrators_role_check 
CHECK (role IN ('system', 'contents'));

-- 3. DEFAULT 값 변경
ALTER TABLE administrators 
ALTER COLUMN role SET DEFAULT 'system';


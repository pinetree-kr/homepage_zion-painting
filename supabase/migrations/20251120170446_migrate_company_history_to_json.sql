-- 회사 연혁을 company_info의 JSONB 컬럼으로 마이그레이션

-- 1. company_info 테이블에 histories JSONB 컬럼 추가
ALTER TABLE company_info 
ADD COLUMN IF NOT EXISTS histories JSONB DEFAULT '[]'::jsonb;

-- 2. 기존 company_history 테이블의 데이터를 JSON으로 변환하여 마이그레이션
-- display_order 기준으로 정렬하여 배열로 변환
-- company_info가 없거나 company_history가 비어있을 경우를 대비
DO $$
DECLARE
  history_json JSONB;
BEGIN
  -- company_history 데이터를 JSON 배열로 변환
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'year', year,
        'month', month,
        'content', content,
        'type', COALESCE(type, 'biz'),
        'display_order', display_order,
        'created_at', created_at,
        'updated_at', updated_at
      ) ORDER BY display_order ASC
    ),
    '[]'::jsonb
  )
  INTO history_json
  FROM company_history;

  -- company_info가 존재하면 업데이트, 없으면 생성
  IF EXISTS (SELECT 1 FROM company_info LIMIT 1) THEN
    UPDATE company_info
    SET histories = COALESCE(history_json, '[]'::jsonb)
    WHERE histories IS NULL OR histories = '[]'::jsonb;
  ELSE
    INSERT INTO company_info (histories)
    VALUES (COALESCE(history_json, '[]'::jsonb));
  END IF;
END $$;

-- 3. 인덱스 추가 (JSONB 쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_company_info_histories ON company_info USING GIN (histories);

-- 4. company_history 테이블 삭제 (필요시 주석 해제)
-- 주의: 데이터 백업 후 실행하세요
-- DROP TABLE IF EXISTS company_history CASCADE;

-- 5. RLS 정책 업데이트 (company_info는 이미 정책이 있으므로 histories도 포함됨)

